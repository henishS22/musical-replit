import { FeedsService } from '@/src/feeds/feeds.service';
import { Inject, Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';

@Injectable()
export class FeedsServices {
  constructor(@Inject('USERS') private readonly feedService: FeedsService) {}

  private readonly FEED_GROUP: string = 'user';

  createdCollaborationOpportunity(collabId: any, userId: any) {
    this.feedService.addCreatedCollaborationOpportunity(collabId, userId);
  }

  followUserFeed(follower: string, feedId: string) {
    this.feedService.followFeed(follower, feedId, this.FEED_GROUP);
  }

  unfollowUserFeed(follower: string, feedId: string) {
    this.feedService.followFeed(follower, feedId, this.FEED_GROUP);
  }

  invitedUserJoined(
    inviterUserId: string | ObjectId | any,
    invitedUserId: string | ObjectId | any,
  ) {
    this.feedService.addInvitedUserJoined(inviterUserId, invitedUserId);
  }
}
