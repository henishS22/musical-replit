import * as fs from 'fs';
import * as path from 'path';
import { User } from '@/src/schemas/schemas';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AutoHashtagsDto, CreateProfileDto } from './dto/ayrshare.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import ServiceException from './exceptions/ServiceException';
import { ExceptionsEnum } from '../utils/enums';
import axios, { AxiosResponse } from 'axios';
import { ObjectId } from 'mongodb';

// Path to your ayrshare private key file
const privateKeyPath = path.join(__dirname, '../../ayrshare.key');

@Injectable()
export class AyrshareService {
  private readonly privateKey = fs.readFileSync(privateKeyPath, 'utf-8');
  private readonly apiKey = process.env.AYRSHARE_API_KEY;
  private readonly baseUrl = process.env.AYRSHARE_BASE_URL;

  constructor(@InjectModel(User.name) private userModel: Model<User>) { }

  async apiRequest(
    endpoint: string,
    method: string,
    body?: object,
    profileKey?: string,
  ) {
    const url = this.baseUrl + endpoint;
    const httpService = new HttpService();
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
    };
    if (profileKey) {
      headers['Profile-Key'] = profileKey;
    }
    let response: AxiosResponse;
    switch (method) {
      case 'POST':
        response = await firstValueFrom(
          httpService.post(url, body, { headers }),
        );
        break;
      case 'GET':
        response = await firstValueFrom(httpService.get(url, { headers }));
        break;
      case 'DELETE':
        response = await firstValueFrom(
          httpService.request({
            method: 'DELETE',
            url,
            data: body,
            headers,
          }),
        );
        break;
      default:
        break;
    }
    return response;
  }

  async createProfile(
    createProfileDto: CreateProfileDto,
    owner: string,
  ): Promise<any> {
    // check if profile is already created or not
    const profile = await this.userModel.findOne({ _id: owner });

    if (profile && profile?.ayrshare?.profileCreated) {
      throw new ServiceException(
        'Ayrshare profile for this user is already created',
        ExceptionsEnum.BadRequest,
      );
    }
    const endpoint = '/api/profiles';
    const response = await this.apiRequest(endpoint, 'POST', createProfileDto);

    if (response?.data?.status === 'success') {
      const data = response.data;
      await this.userModel.updateOne(
        { _id: owner },
        {
          ayrshare: {
            profile: {
              title: data.title,
              profileKey: data.profileKey,
              refId: data.refId,
            },
            profileCreated: true,
          },
        },
      );
    }
    return response.data;
  }

  async checkForAyrshareProfile(owner: string) {
    const profile = await this.userModel.findOne({ _id: owner });
    if (!profile?.ayrshare?.profileCreated) {
      throw new ServiceException(
        'Ayrshare profile for this user is not created, please create ayrshare user profile first.',
        ExceptionsEnum.BadRequest,
      );
    }
    return profile;
  }

  async generateJWT(owner: string) {
    // fetch user
    const profile = await this.checkForAyrshareProfile(owner);
    const requestBody = {
      domain: 'id-3g4u3',
      privateKey: this.privateKey,
      profileKey: profile.ayrshare.profile.profileKey,
      verify: true, // Recommend to only use in non-production environment.
    };
    const endpoint = `/api/profiles/generateJWT`;
    const response = await this.apiRequest(
      endpoint,
      'POST',
      requestBody,
      profile.ayrshare.profile.profileKey,
    );
    return response?.data;
  }

  async userProfile(owner: string) {
    // check if ayrshare profile exists or not
    const profile = await this.checkForAyrshareProfile(owner);
    const endpoint = `/api/profiles?refId=${profile.ayrshare.profile.refId}`;
    const response = await this.apiRequest(endpoint, 'GET');
    return { profile, ...response?.data };
  }

  async unlinkSocialNetwork(owner: string, platform: string) {
    // check if ayrshare profile exists or not
    const profile = await this.checkForAyrshareProfile(owner);
    const endpoint = `/api/profiles/social`;
    const response = await this.apiRequest(
      endpoint,
      'DELETE',
      { platform },
      profile.ayrshare.profile.profileKey,
    );
    return response?.data;
  }

  async autoHastags(owner: string, body: AutoHashtagsDto) {
    // check for ayrshare profile exists or not
    const profile = await this.checkForAyrshareProfile(owner);
    const endpoint = `/api/hashtags/auto`;
    const requestBody = {
      post: body?.content,
      language: body?.language || 'en',
      position: body?.position || 'auto',
    };
    const response = await this.apiRequest(
      endpoint,
      'POST',
      requestBody,
      profile.ayrshare.profile.profileKey,
    );
    return response?.data;
  }

  // campaigns data
  async campaignsData(owner: string) {
    //posts
    let totalVideoCount = 0;
    let totalPinterestSave = 0;
    let totalBlueskyPosts = 0;
    let totalInstagramMedia = 0;
    let totalRedditKarma = 0;
    let totalListedCount = 0;

    //video plays
    let fbVideo = 0;
    let instaVideo = 0;
    let linkedinVideo = 0;
    let pinterestVideo = 0;
    let tiktokVideo = 0;
    let youtubeVideo = 0;

    //impressions
    let facebookImpressions = 0;
    let gmbImpressions = 0;
    let linkedinImpressions = 0;
    let pinterestImpressions = 0;

    //reach
    let instaReach = 0;

    const profile = await this.userProfile(owner);
    if (!profile) return { posts: 0, videoPlays: 0, impressions: 0, reach: 0 };

    const profileKey = profile?.profile?.ayrshare?.profile?.profileKey;
    const platforms = profile?.profiles[0]?.activeSocialAccounts
    if (!platforms || platforms.length === 0) return { posts: 0, videoPlays: 0, impressions: 0, reach: 0 };

    const analyticsResponse = await this.apiRequest(
      `/api/analytics/social`,
      'POST',
      { platforms },
      profileKey
    );

    const data = analyticsResponse?.data;

    if (!data) return { posts: 0, videoPlays: 0, impressions: 0, reach: 0 };

    //posts
    totalVideoCount += parseInt(data.youtube?.analytics?.videoCount ?? 0, 10);
    totalPinterestSave += data.pinterest?.analytics?.save ?? 0;
    totalBlueskyPosts += data.bluesky?.analytics?.postsCount ?? 0;
    totalInstagramMedia += data.instagram?.analytics?.mediaCount ?? 0;
    totalRedditKarma += data.reddit?.analytics?.totalKarma ?? 0;
    totalListedCount += data.twitter?.analytics?.tweetCount ?? 0;

    //video plays
    fbVideo += data.facebook?.analytics?.pageVideoViews ?? 0;
    instaVideo += data.instagram?.analytics?.viewsCount ?? 0;
    linkedinVideo += data.linkedin?.analytics?.views?.allPageViews ?? 0;
    pinterestVideo += data.pinterest?.analytics?.videoStart ?? 0;
    tiktokVideo += data.tiktok?.analytics?.viewCountTotal ?? 0;
    youtubeVideo += data.youtube?.analytics?.views ?? 0;

    //impressions
    if (data?.gmb?.analytics) {
      gmbImpressions +=
        (data?.gmb?.analytics.businessImpressionsDesktopMaps ?? 0) +
        (data?.gmb?.analytics.businessImpressionsDesktopSearch ?? 0) +
        (data?.gmb?.analytics.businessImpressionsMobileMaps ?? 0) +
        (data?.gmb?.analytics.businessImpressionsMobileSearch ?? 0);
    }
    linkedinImpressions += data.linkedin?.analytics?.impressionCount ?? 0;
    facebookImpressions += data.facebook?.analytics?.pageImpressions ?? 0;
    pinterestImpressions += data.pinterest?.analytics?.impression ?? 0;

    //reach
    instaReach += data.instagram?.analytics?.reachCount ?? 0;

    const posts = totalVideoCount + totalPinterestSave + totalBlueskyPosts + totalInstagramMedia + totalRedditKarma + totalListedCount;
    const videoPlays = fbVideo + instaVideo + linkedinVideo + pinterestVideo + tiktokVideo + youtubeVideo;
    const impressions = facebookImpressions + gmbImpressions + linkedinImpressions + pinterestImpressions;
    const reach = instaReach

    return { posts, videoPlays, impressions, reach }
  }
}
