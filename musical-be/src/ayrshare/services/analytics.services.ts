import {
  PostAnalyticsDto,
  SocialNetworkAnalyticsDto,
} from '../dto/analytics.dto';
import { AyrshareService } from '../ayrshare.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  constructor(private readonly ayrshareService: AyrshareService) {}

  async postAnalytics(owner: string, body: PostAnalyticsDto) {
    // check if user exists or not
    const profile = await this.ayrshareService.checkForAyrshareProfile(owner);
    const endpoint = `/api/analytics/post`;
    try {
      const response = await this.ayrshareService.apiRequest(
        endpoint,
        'POST',
        body,
        profile.ayrshare.profile.profileKey,
      );
      return response.data;
    } catch (err) {
      throw new Error(
        err?.response?.data?.posts[0]?.errors[0]?.message || err.message,
      );
    }
  }

  async socialNetworkAnalytics(owner: string, body: SocialNetworkAnalyticsDto) {
    // check if user exists or not
    const profile = await this.ayrshareService.checkForAyrshareProfile(owner);
    const endpoint = `/api/analytics/social`;
    try {
      const response = await this.ayrshareService.apiRequest(
        endpoint,
        'POST',
        body,
        profile.ayrshare.profile.profileKey,
      );
      return response.data;
    } catch (err) {
      throw new Error(
        err?.response?.data?.message ??
          err?.response?.data?.message?.posts[0]?.errors[0]?.message ??
          err.message,
      );
    }
  }
}
