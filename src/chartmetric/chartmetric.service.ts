import { Injectable, Inject, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from '../schemas/schemas';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ChartMetricService {
  private readonly refreshtoken = process.env.CHARTMETRIC_REFRESH_TOKEN;
  private readonly baseUrl = process.env.CHARTMETRIC_BASE_URL;
  constructor(@InjectModel(User.name) private userModel: Model<User>) { }

  async createToken() {
    const url = `${this.baseUrl}/token`;
    const httpService = new HttpService();
    const body = {
      refreshtoken: this.refreshtoken,
    };
    const headers = {
      'Content-Type': 'application/json',
    };

    const response: AxiosResponse = await firstValueFrom(
      httpService.post(url, body, { headers }),
    );

    return response ? response.data.token : '';
  }

  async getChartmetricId(query: string) {
    const token = await this.createToken();
    const url = `${this.baseUrl}/search?q=${encodeURIComponent(
      query,
    )}&limit=10&type=artists`;

    const httpService = new HttpService();

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response: AxiosResponse = await firstValueFrom(
      httpService.get(url, { headers }),
    );

    return response?.data?.obj || null;
  }

  async getSocialAudienceStats(artistId: string, token: string) {
    // Artist - Metadata
    const url = `${this.baseUrl}/artist/${artistId}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      'X-Accept-Partial-Data': 'true',
    };
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.log('Error fetching artist data:', error);
      return null;
    }
  }

  async getChartMetric(data: any) {
    const { url, token } = data;
    const headers = {
      Authorization: `Bearer ${token}`,
      'X-Accept-Partial-Data': 'true',
    };
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.log('Error fetching artist data:', error);
      return null;
    }
  }

  async getChartmeticData(owner: string) {
    const token = await this.createToken();
    const user = await this.userModel.findOne({ _id: owner });

    let artistId;
    if (user?.chartmetricId) {
      artistId = user?.chartmetricId;
    } else {
      const platforms = [
        'spotify',
        'apple_music',
        'instagram',
        'tiktok',
        'twitter',
        'youtube',
      ];
      let chartmetricId = null;

      for (const platform of platforms) {
        const link = user?.[platform];
        if (!link) continue;

        chartmetricId = await this.getChartmetricId(link);

        if (chartmetricId && chartmetricId.artists?.length > 0) {
          artistId = chartmetricId?.artists[0]?.id;
          user.chartmetricId = artistId;
          await user.save();
          break;
        }
      }
    }

    const socialAudienceStats = await this.getSocialAudienceStats(
      artistId,
      token,
    );

    // const spotify = {
    //     "spotify_followers": socialAudienceStats?.obj.cm_statistics.sp_followers ?? 0,
    //     "sp_popularity": socialAudienceStats?.obj.cm_statistics.sp_popularity ?? 0,
    //     "sp_monthly_listeners": socialAudienceStats?.obj.cm_statistics.sp_monthly_listeners ?? 0,
    //     "num_sp_playlists": socialAudienceStats?.obj.cm_statistics.num_sp_playlists ?? 0,
    //     "sp_playlist_total_reach": socialAudienceStats?.obj.cm_statistics.sp_playlist_total_reach ?? 0,
    // }

    // const youtube = {
    //     "ycs_subscribers": socialAudienceStats?.obj.cm_statistics.ycs_subscribers ?? 0,
    //     "ycs_views": socialAudienceStats?.obj.cm_statistics.ycs_views ?? 0,
    //     "num_yt_playlists": socialAudienceStats?.obj.cm_statistics.num_yt_playlists ?? 0,
    //     "youtube_monthly_video_views": socialAudienceStats?.obj.cm_statistics.youtube_monthly_video_views ?? 0,
    //     "youtube_daily_video_views": socialAudienceStats?.obj.cm_statistics.youtube_daily_video_views ?? 0,
    //     "yt_playlist_total_reach": socialAudienceStats?.obj.cm_statistics.yt_playlist_total_reach ?? 0,
    // }

    // const deezer = {
    //     "deezer_fans": socialAudienceStats?.obj.cm_statistics.deezer_fans ?? 0,
    // }

    // const facebook = {
    //     "facebook_followers": socialAudienceStats?.obj.cm_statistics.facebook_followers ?? 0,
    // }

    // const twitter = {
    //     "twitter_followers": socialAudienceStats?.obj.cm_statistics.twitter_followers ?? 0,
    // }

    // const soundcloud = {
    //     "soundcloud_followers": socialAudienceStats?.obj.cm_statistics.soundcloud_followers ?? 0,
    // }

    // const instagram = {
    //     "ins_followers": socialAudienceStats?.obj.cm_statistics.ins_followers ?? 0,
    // }

    // const tiktok = {
    //     "tiktok_followers": socialAudienceStats?.obj.cm_statistics.tiktok_followers ?? 0,
    //     "tiktok_track_posts": socialAudienceStats?.obj.cm_statistics.tiktok_track_posts ?? 0,
    //     "tiktok_likes": socialAudienceStats?.obj.cm_statistics.tiktok_likes ?? 0,
    //     "tiktok_top_video_views": socialAudienceStats?.obj.cm_statistics.tiktok_top_video_views ?? 0,
    // }

    // const pandora = {
    //     "pandora_listeners_28_day": socialAudienceStats?.obj.cm_statistics.pandora_listeners_28_day ?? 0,
    //     "pandora_lifetime_stations_added": socialAudienceStats?.obj.cm_statistics.pandora_lifetime_stations_added ?? 0,
    //     "pandora_lifetime_streams": socialAudienceStats?.obj.cm_statistics.pandora_lifetime_streams ?? 0,
    // }

    // const shazam = {
    //     "shazam_count": socialAudienceStats?.obj.cm_statistics.shazam_count ?? 0,
    // }

    const data = socialAudienceStats?.obj?.cm_statistics;
    const totalFollowers =
      (data?.sp_followers || 0) +
      (data?.ycs_subscribers || 0) +
      (data?.deezer_fans || 0) +
      (data?.facebook_followers || 0) +
      (data?.twitter_followers || 0) +
      (data?.soundcloud_followers || 0) +
      (data?.ins_followers || 0) +
      (data?.tiktok_followers || 0) +
      (data?.pandora_listeners_28_day || 0);

    const totalViews =
      (data?.sp_playlist_total_reach || 0) +
      (data?.ycs_views || 0) +
      (data?.tiktok_top_video_views || 0) +
      (data?.pandora_lifetime_streams || 0);

    const totalReach =
      (data?.yt_playlist_total_reach || 0) +
      (data?.sp_playlist_total_reach || 0);

    const totalPost =
      (data?.num_sp_playlists || 0) +
      (data?.num_yt_playlists || 0) +
      (data?.tiktok_track_posts || 0);

    const percentageFollowers =
      (data?.monthly_diff_percent?.sp_followers || 0) +
      (data?.monthly_diff_percent?.ycs_subscribers || 0) +
      (data?.monthly_diff_percent?.deezer_fans || 0) +
      (data?.monthly_diff_percent?.facebook_followers || 0) +
      (data?.monthly_diff_percent?.twitter_followers || 0) +
      (data?.monthly_diff_percent?.soundcloud_followers || 0) +
      (data?.monthly_diff_percent?.ins_followers || 0) +
      (data?.monthly_diff_percent?.tiktok_followers || 0) +
      (data?.monthly_diff_percent?.pandora_listeners_28_day || 0);

    const percentageViews =
      (data?.monthly_diff_percent?.sp_monthly_listeners || 0) +
      (data?.monthly_diff_percent?.ycs_views || 0) +
      (data?.monthly_diff_percent?.tiktok_top_video_views || 0) +
      (data?.monthly_diff_percent?.pandora_lifetime_streams || 0);

    const percentageReach =
      (data?.monthly_diff_percent?.yt_playlist_total_reach || 0) +
      (data?.monthly_diff_percent?.sp_playlist_total_reach || 0);

    const percentagePost =
      (data?.monthly_diff_percent?.num_sp_playlists || 0) +
      (data?.monthly_diff_percent?.num_yt_playlists || 0) +
      (data?.monthly_diff_percent?.tiktok_track_posts || 0);

    const stats = {
      totalFollowers,
      totalViews,
      totalReach,
      totalPost,
      percentageFollowers,
      percentageViews,
      percentageReach,
      percentagePost,
    };
    return stats;
  }

  async getReleases(owner: string) {
    const user = await this.userModel.findOne({ _id: owner });

    let artistId;
    if (user?.chartmetricId) {
      artistId = user?.chartmetricId;
    } else {
      const platforms = [
        'spotify',
        'apple_music',
        'instagram',
        'tiktok',
        'twitter',
        'youtube',
      ];
      let chartmetricId = null;

      for (const platform of platforms) {
        const link = user?.[platform];
        if (!link) continue;

        chartmetricId = await this.getChartmetricId(link);

        if (chartmetricId && chartmetricId.artists?.length > 0) {
          artistId = chartmetricId?.artists[0]?.id;
          user.chartmetricId = artistId;
          await user.save();
          break;
        }
      }
    }

    const response = {
      artistRank: 0,
      topTracksByPlatform: 0,
      cpp: 0,
    };

    if (artistId) {
      const token = await this.createToken();
      const artistRank = await this.getChartMetric({
        url: `${this.baseUrl}/artist/${artistId}/artist-rank`,
        token,
      });
      if (artistRank) {
        response.artistRank = artistRank?.obj.artist_rank;
      }

      const topTracksByPlatform = await this.getChartMetric({
        url: `${this.baseUrl}/artist/${artistId}/top-tracks/tiktok`,
        token,
      });
      if (topTracksByPlatform) {
        response.topTracksByPlatform += topTracksByPlatform?.obj[0].views;
      }

      const cpp = await this.getChartMetric({
        url: `${this.baseUrl}/artist/${artistId}/cpp?latest=true`,
        token,
      });
      if (cpp) {
        response.cpp = cpp?.obj[0].score;
      }
    }

    return response;
  }

  async getAudience(owner: string) {
    const user = await this.userModel.findOne({ _id: owner });
    const sources = [
      'spotify',
      'apple_music',
      'instagram',
      'tiktok',
      'twitter',
      'youtube',
    ];

    let artistId;
    if (user?.chartmetricId) {
      artistId = user?.chartmetricId;
    } else {
      let chartmetricId = null;

      for (const source of sources) {
        const link = user?.[source];
        if (!link) continue;

        chartmetricId = await this.getChartmetricId(link);

        if (chartmetricId && chartmetricId.artists?.length > 0) {
          artistId = chartmetricId?.artists[0]?.id;
          user.chartmetricId = artistId;
          await user.save();
          break;
        }
      }
    }

    const response = {
      fanMetrics: {
        value: 0,
        monthlyDiffPercentage: 0,
      },
      socialAudienceData: [],
      socialAudienceStats: {},
    };
    if (artistId) {
      const token = await this.createToken();
      for (const source of sources) {
        const fanMetrics = await this.getChartMetric({
          url: `${this.baseUrl}/artist/${artistId}/stat/${source}?field=listeners`,
          token,
        });
        if (fanMetrics) {
          response.fanMetrics = {
            value: fanMetrics?.obj.listeners[0].value,
            monthlyDiffPercentage:
              fanMetrics?.obj.listeners[0].monthly_diff_percent,
          };
        }
      }

      let countSocial = 0;
      let socialArr = [];
      const IgAudienceData = await this.getChartMetric({
        url: `${this.baseUrl}/artist/${artistId}/instagram-audience-stats`,
        token,
      });
      if (IgAudienceData) {
        socialArr = [...socialArr, ...IgAudienceData?.obj.audience_genders];
        countSocial += 1;
      }

      const tiktokAudienceData = await this.getChartMetric({
        url: `${this.baseUrl}/artist/${artistId}/tiktok-audience-stats`,
        token,
      });
      if (tiktokAudienceData) {
        socialArr = [...socialArr, ...tiktokAudienceData?.obj.audience_genders];
        countSocial += 1;
      }

      const youtubeAudienceData = await this.getChartMetric({
        url: `${this.baseUrl}/artist/${artistId}/youtube-audience-stats`,
        token,
      });
      if (youtubeAudienceData) {
        socialArr = [
          ...socialArr,
          ...youtubeAudienceData?.obj.audience_genders,
        ];
        countSocial += 1;
      }
      if (socialArr && socialArr.length) {
        let maleWeight = 0;
        let femaleWeight = 0;
        for (let i = 0; i < socialArr.length; i++) {
          const social = socialArr[i];
          if (social) {
            if (social.code == 'male') {
              maleWeight += Number(social.weight);
            }
            if (social.code == 'female') {
              femaleWeight += Number(social.weight);
            }
          }
        }
        const avgMaleweight = maleWeight / countSocial;
        const avgFemaleweight = femaleWeight / countSocial;
        response.socialAudienceData = [
          {
            code: 'male',
            weight: avgMaleweight,
          },
          {
            code: 'female',
            weight: avgFemaleweight,
          },
        ];
      }

      const domains = ['instagram', 'youtube', 'tiktok'];
      const socialAudienceStatsObj = {
        followers: 0,
        avgLikesPerPost: 0,
        avgCommentsPerPost: 0,
        engagementRate: 0,
      };
      for (const domain of domains) {
        const socialAudienceStats = await this.getChartMetric({
          url: `${this.baseUrl}/artist/${artistId}/social-audience-stats?domain=${domain}&audienceType=followers&statsType=stat`,
          token,
        });
        if (socialAudienceStats) {
          socialAudienceStatsObj.followers +=
            socialAudienceStats?.obj[0].followers;
          socialAudienceStatsObj.avgLikesPerPost +=
            socialAudienceStats?.obj[0].avg_likes_per_post;
          socialAudienceStatsObj.avgCommentsPerPost +=
            socialAudienceStats?.obj[0].avg_comments_per_post;
          if (socialAudienceStats?.obj[0].engagement_rate) {
            socialAudienceStatsObj.engagementRate +=
              socialAudienceStats?.obj[0].engagement_rate;
          }
        }
      }
      response.socialAudienceStats = socialAudienceStatsObj;
    }

    return response;
  }

  async chartmeticData(owner: string) {
    const token = await this.createToken();
    const user = await this.userModel.findOne({ _id: owner });

    let artistId;
    if (user?.chartmetricId) {
      artistId = user?.chartmetricId;
    } else {
      const platforms = [
        'spotify',
        'apple_music',
        'instagram',
        'tiktok',
        'twitter',
        'youtube',
      ];
      let chartmetricId = null;

      for (const platform of platforms) {
        const link = user?.[platform];
        if (!link) continue;

        chartmetricId = await this.getChartmetricId(link);

        if (chartmetricId && chartmetricId.artists?.length > 0) {
          artistId = chartmetricId?.artists[0]?.id;
          user.chartmetricId = artistId;
          await user.save();
          break;
        }
      }
    }

    const socialAudienceStats = await this.getSocialAudienceStats(
      artistId,
      token,
    );

    return socialAudienceStats?.obj ?? null;
  }
}
