import { Post } from '@/src/schemas/schemas';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PublishPostDto, GetScheduledPostsDto } from '../dto/posts.dto';
import { AyrshareService } from '../ayrshare.service';
import { HttpService } from '@nestjs/axios';
import { MediaService } from './media.services';
import { ResizePostDto, SentimentsDto } from '../dto/maxPack.dto';
import { resourceNotFound } from '@/src/users/utils/errors';

@Injectable()
export class PostsService {
  private readonly apiKey = process.env.AYRSHARE_API_KEY;
  private readonly baseUrl = process.env.AYRSHARE_BASE_URL;

  constructor(
    private readonly ayrshareService: AyrshareService,
    @InjectModel(Post.name) private postModel: Model<Post>,
    private readonly httpService: HttpService,
    private readonly mediaService: MediaService
  ) { }

  async publishPost(owner: string, body: PublishPostDto) {
    // check if user exists or not
    const profile = await this.ayrshareService.checkForAyrshareProfile(owner);
    const endpoint = `/api/post`;
    try {
      const response = await this.ayrshareService.apiRequest(
        endpoint,
        'POST',
        body,
        profile.ayrshare.profile.profileKey,
      );

      const postRequest = {
        userId: profile._id,
        profileKey: profile.ayrshare.profile.profileKey,
        profileTitle: response?.data?.posts[0]?.profileTitle,
        id: response?.data?.posts[0]?.id,
        refId: response?.data?.posts[0]?.refId,
        type: response?.data?.posts[0]?.status === 'scheduled' ? 'scheduled' : 'now',
        platforms: body.platforms,
        post: response?.data?.posts[0]?.post,
        status: response?.data?.posts[0]?.status,
        errors: response?.data?.posts[0]?.errors ?? []
      }

      // Delete media if immediate post
      if (postRequest.type === 'now' && body.mediaUrls.length > 0) {
        for (const mediaUrl of body.mediaUrls) {
          const mediaDetails = await this.mediaService.extractBucketAndKey(mediaUrl);
          if (mediaDetails) {
            const { bucketName, key } = mediaDetails;
            await this.mediaService.removeFile(key);
          }
        }
      }

      if (postRequest.type === 'scheduled') {
        postRequest['scheduleDate'] = response?.data?.posts[0]?.scheduleDate
      }
      if (postRequest.status === 'success') {
        postRequest['postIds'] = response?.data?.posts[0]?.postIds
      }
      if (body?.youTubeOptions) {
        postRequest['youTubeOptions'] = body.youTubeOptions
      }
      const postResponse = await this.postModel.create(postRequest)
      return postResponse
    } catch (err) {
      throw new Error(
        err?.response?.data?.posts[0]?.errors[0]?.message || err.message,
      );
    }
  }

  async postDetails(id: string, profileKey: string) {
    const endpoint = `/api/post/${id}`;
    const response = await this.ayrshareService.apiRequest(
      endpoint,
      'GET',
      {},
      profileKey,
    );
    return response.data;
  }

  async getPosts(owner: string) {
    // check if user exists or not
    const profile = await this.ayrshareService.checkForAyrshareProfile(owner);
    const posts = await this.postModel.find({ userId: profile._id });
    const result = [];
    for await (const post of posts) {
      const data = await this.postDetails(
        post.id,
        profile.ayrshare.profile.profileKey,
      );
      // if (data.status === 'success') {
      //   result.push(data);
      // }
      result.push(data)
    }
    return result;
  }

  async getScheduledPosts(owner: string, filters: GetScheduledPostsDto) {
    // check if user exists or not
    const profile = await this.ayrshareService.checkForAyrshareProfile(owner);
    const query: any = {
      userId: profile._id,
      isScheduled: true,
    };

    // Add date filters if provided
    if (filters.startDate || filters.endDate) {
      query.scheduledAt = {};

      if (filters.startDate) {
        query.scheduledAt.$gte = new Date(filters.startDate);
      }

      if (filters.endDate) {
        query.scheduledAt.$lte = new Date(filters.endDate);
      }
    }

    return await this.postModel
      .find(query)
      .sort({ scheduledAt: 1 }) // Sort by scheduledAt in ascending order
      .exec();
  }

  async getPostHistory(owner: string, params: {
    status?: string;
    lastDays?: number;
    limit?: number;
    type?: string;
    platform?: string;
  }) {
    try {
      const profile = await this.ayrshareService.checkForAyrshareProfile(owner);

      // Build query string from params
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });

      const endpoint = `/api/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await this.ayrshareService.apiRequest(
        endpoint,
        'GET',
        {},
        profile.ayrshare.profile.profileKey,
      );
      return response.data;
    } catch (error) {
      if (error?.response?.data?.history?.code === 221) {
        const data = {
          history: [],
          refId: error?.response?.data?.refId,
          count: 0,
        }
        return data;
      }
      throw new HttpException(
        error.response?.data?.message || 'Failed to fetch post history',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async removeScheduledMedia() {
    try {
      const currentDate = new Date();
      const oneDayAgo = new Date(currentDate);
      oneDayAgo.setDate(currentDate.getDate() - 1);

      // Find posts where type='scheduled' and scheduleDate + 1 day < current date
      const expiredPosts = await this.postModel.find({
        type: 'scheduled',
        scheduleDate: { $lt: oneDayAgo },
      });

      const batchSize = 20; // Define the batch size for concurrency control
      for (let i = 0; i < expiredPosts.length; i += batchSize) {
        const batch = expiredPosts.slice(i, i + batchSize);

        // Process each batch concurrently
        await Promise.all(
          batch.map(async (post) => {
            if (post.mediaUrls && post.mediaUrls.length > 0) {
              // Remove all media files for the post concurrently
              await Promise.all(
                post.mediaUrls.map(async (mediaUrl) => {
                  const mediaDetails = await this.mediaService.extractBucketAndKey(mediaUrl);
                  if (mediaDetails) {
                    const { key } = mediaDetails;
                    await this.mediaService.removeFile(key);
                  }
                }),
              );
            }
          }),
        );
      }
    } catch (err) {
      console.log('Error while deleting media for schedule posts: ', err.message)
    }
  }

  async resizePost(owner: string, body: ResizePostDto) {
    await this.ayrshareService.checkForAyrshareProfile(owner);
    try {
      const endpoint = `/api/media/resize`;
      const response = await this.ayrshareService.apiRequest(
        endpoint,
        'POST',
        body,
      );

      return response.data;
    } catch (error) {
      console.error('Error resizing image:', error.response.data.message);
      return resourceNotFound('Error resizing image')
    }
  }

  async sentimentAnalysis(owner: string, body: SentimentsDto) {
    try {
      await this.ayrshareService.checkForAyrshareProfile(owner);
      const endpoint = `/api/generate/sentiments`;
      const response = await this.ayrshareService.apiRequest(
        endpoint,
        'POST',
        body,
      );

      return response.data;
    } catch (error) {
      console.error('Error resizing image:', error.response.data.message);
      return resourceNotFound('Error while sentiment analyzing')
    }
  }
}