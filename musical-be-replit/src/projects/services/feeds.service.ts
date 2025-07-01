import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { FeedsDefinedExternalTopics } from '../utils/external.topics.definitions';

@Injectable()
export class FeedsService {
  private readonly FEED_GROUP: string = 'project';

  constructor(@Inject('PROJECTS') private readonly clientKafka: ClientKafka) {}

  followProjectFeed(follower: string, feedId: string) {
    return this.clientKafka.emit(FeedsDefinedExternalTopics.followFeed.topic, {
      userId: follower,
      feedId,
      feedGroup: this.FEED_GROUP,
    });
  }

  unfollowProjectFeed(follower: string, feedId: string) {
    return this.clientKafka.emit(
      FeedsDefinedExternalTopics.unfollowFeed.topic,
      {
        userId: follower,
        feedId,
        feedGroup: this.FEED_GROUP,
      },
    );
  }

  addCommentedOnProjectActivity(
    feedId: string,
    userId: string,
    comment: string,
  ) {
    return this.clientKafka.emit(
      FeedsDefinedExternalTopics.addedCommentOnProject.topic,
      {
        projectId: feedId,
        userId,
        comment,
      },
    );
  }

  addAddedTracksToProjectActivity(
    feedId: string,
    userId: string,
    tracks: string[],
  ) {
    return this.clientKafka.emit(
      FeedsDefinedExternalTopics.addedTracksToProject.topic,
      {
        projectId: feedId,
        userId,
        tracks,
      },
    );
  }

  addAddedTracksToReleaseActivity(
    feedId: string,
    releaseId: string,
    userId: string,
    tracks: string[],
  ) {
    return this.clientKafka.emit(
      FeedsDefinedExternalTopics.addedTracksToRelease.topic,
      {
        projectId: feedId,
        releaseId,
        userId,
        tracks,
      },
    );
  }
}
