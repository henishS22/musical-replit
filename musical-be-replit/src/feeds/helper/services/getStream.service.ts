import { ExceptionsEnum, ReactionsTypes } from '../utils/enums';
import {
  APIChangeSimpleReactionResponse,
  FeedFollow,
  FeedGroup,
  GetActivitiesOptions,
  NewActivity,
  UserHasReactionOnActivityOptions,
} from '../utils/types';
import { Inject, Injectable } from '@nestjs/common';
import {
  StreamClient,
  Activity as GetStreamActivity,
  GetFeedOptions,
  UR,
  ReactionFilterConditions,
  ReactionAPIResponse,
  FlatActivity,
  DefaultGenerics,
  FlatActivityEnriched,
} from 'getstream';
import ServiceException from '../exceptions/ServiceException';

@Injectable()
export class GetStreamService {
  constructor(
    @Inject('GETSTREAM_CLIENT') private readonly getStreamClient: StreamClient,
  ) {}

  /**
   * Adds an activity to a user feed.
   *
   * @param {NewActivity} activity
   * @returns {Promise<GetStreamActivity>}
   */
  async createActivity(
    activity: NewActivity,
    feedGroup: FeedGroup = 'user',
    feedId: string,
  ): Promise<GetStreamActivity> {
    const activityTime = new Date().toISOString();

    activity.time = activityTime;
    activity.origin = `${feedGroup}:${feedId}`;

    const feed = this.getStreamClient.feed(feedGroup, feedId);

    const createdActivity = await feed.addActivity(activity);

    return createdActivity;
  }

  /**
   * Retrieve the activities of an user feed.
   *
   * @param {string} userId
   * @param {GetActivitiesOptions} options
   */
  async getFeedActivities(userId: string, options?: GetActivitiesOptions) {
    const feed: any = this.getStreamClient.feed('user', userId);

    const getOptions: GetFeedOptions = {
      limit: options?.limit || 15,
      ownReactions: true,
      withOwnReactions: true,
      withReactionCounts: true,
      user_id: userId,
    };

    if (options?.afterId) {
      getOptions.id_lt = options.afterId;
    }

    const activities = await feed.get(getOptions);

    return activities;
  }

  /**
   * Retrieve the reactions of an activity.
   *
   * @param {string} activityId
   * @param {?string} afterId
   */
  getSimpleReactions(
    activityId: string,
    {
      afterId,
      type,
      limit,
    }: {
      afterId?: string;
      type?: ReactionsTypes;
      limit?: number;
    },
  ) {
    const options: ReactionFilterConditions = {
      activity_id: activityId,
      limit: limit || 15,
    };

    if (type) {
      options.kind = type;
    }

    if (afterId) {
      options.id_lt = afterId;
    }

    return this.getStreamClient.reactions.filter(options);
  }

  /**
   * Follows a user feed.
   *
   * @param {FeedFollow} follower
   * @param {FeedFollow} following
   * @param {boolean} copyActivities - If true, the follower will copy previous activities from the following feed.
   */
  async followFeed(
    follower: FeedFollow,
    following: FeedFollow,
    copyActivities = true,
  ): Promise<void> {
    const feed = this.getStreamClient.feed(follower.feedGroup, follower.feedId);
    const options: { limit?: number } = {};

    if (!copyActivities) {
      options.limit = 0;
    }

    await feed.follow(following.feedGroup, following.feedId, options);
  }

  /**
   * Unfollows a feed group.
   *
   * @param {FeedFollow} follower
   * @param {FeedFollow} following
   * @param {boolean} keepHistory
   */
  async unfollowFeed(
    follower: FeedFollow,
    following: FeedFollow,
    keepHistory = false,
  ) {
    const feed = this.getStreamClient.feed(follower.feedGroup, follower.feedId);
    const options = {
      keepHistory,
    };

    await feed.unfollow(following.feedGroup, following.feedId, options);
  }

  /**
   * Creates a comment reaction on an activity.
   *
   * @param {string} comment
   * @param {string} activityId
   * @param {string} userId
   * @returns {Promise<ReactionAPIResponse<UR>>}
   */
  async addComment(comment: string, activityId: string, userId: string) {
    return this.addReaction(
      ReactionsTypes.COMMENT,
      {
        text: comment,
      },
      activityId,
      userId,
    );
  }

  /**
   * Deletes a comment reaction on an activity.
   *
   * @param {string} reactionId
   * @returns {Promise<void>}
   */
  async deleteComment(reactionId: string) {
    await this.removeReaction(reactionId);
  }

  /**
   * Adds or change a reaction on an activity.
   *
   * @param {string} activityId
   * @param {string} userId
   * @param {?ReactionsTypes} type
   * @returns {Promise<APIChangeSimpleReactionResponse>}
   */
  async changeSimpleReaction(
    activityId: string,
    userId: string,
    type?: ReactionsTypes,
  ): Promise<APIChangeSimpleReactionResponse> {
    if (type === ReactionsTypes.COMMENT) {
      throw new ServiceException(
        'Cannot add a comment reaction',
        ExceptionsEnum.BadRequest,
      );
    }

    // Check if user has reacted previously
    const userPreviousReaction = await this.getUserReactionOnActivity({
      activityId,
      userId,
    });

    // Removed previous reaction
    if (userPreviousReaction || userPreviousReaction?.kind === type) {
      await this.removeReaction(userPreviousReaction.id);
    }

    // If a type is provided, create a new one
    if (type && userPreviousReaction?.kind !== type) {
      const result = await this.addReaction(type, {}, activityId, userId);

      return {
        ...result,
        reaction: type,
      };
    }

    return {
      reaction: null,
    };
  }

  /**
   * Returns the feed where an activity is published.
   *
   * @param {string | FlatActivity<DefaultGenerics> | FlatActivityEnriched<DefaultGenerics>} activity
   * @returns {Promise<[FeedGroup, string] | null>}
   */
  async getFeedOfActivity(
    activity:
      | string
      | FlatActivity<DefaultGenerics>
      | FlatActivityEnriched<DefaultGenerics>,
  ): Promise<[FeedGroup, string] | null> {
    let activityData;

    if (typeof activity === 'string') {
      const activities = await this.getStreamClient.getActivities({
        ids: [activity],
      });
      activityData = activities.results[0];
    } else {
      activityData = activity;
    }

    const { target } = activityData;

    if (target) {
      const [feedGroup, feedId] = target.split(':');

      return [feedGroup, feedId];
    }

    return null;
  }

  /**
   * Checks if a user follows a feed.
   *
   * @param {string} userId
   * @param {string} feedId
   * @param {FeedGroup} feedGroup
   * @returns {Promise<boolean>}
   */
  async userFollowsFeed(userId: string, feedId: string, feedGroup: FeedGroup) {
    const followingFeed = `${feedGroup}:${feedId}`;
    const userFeed = this.getStreamClient.feed('user', userId);
    const { results } = await userFeed.following({
      offset: 0,
      filter: [followingFeed],
    });

    const userFollows = results.length > 0;

    return userFollows;
  }

  /**
   * Create a reaction on an activity.
   *
   * @param {ReactionsTypes} type
   * @param {UR} data
   * @param {string} activityId
   * @param {string} userId
   * @returns {Promise<ReactionAPIResponse<UR>>}
   */
  addReaction(
    type: ReactionsTypes,
    data: UR,
    activityId: string,
    userId: string,
  ) {
    return this.getStreamClient.reactions.add(type, activityId, data, {
      userId,
    });
  }

  /**
   * Deletes a reaction on an activity.
   *
   * @param {string} reactionId
   * @returns {Promise<APIResponse>}
   */
  removeReaction(reactionId: string) {
    return this.getStreamClient.reactions.delete(reactionId);
  }

  /**
   * Gets information about a reaction.
   *
   * @param {string} reactionId
   * @returns {Promise<EnrichedReactionAPIResponse<DefaultGenerics>>}
   */
  getReaction(reactionId: string) {
    return this.getStreamClient.reactions.get(reactionId);
  }

  /**
   * Get details of an activity.
   *
   * @param {string} activityId
   * @param {string} userId
   */
  async getActivityDetail(activityId: string, userId: string) {
    const feed = this.getStreamClient.feed('user', userId);
    const activity = await feed.get({
      id_gte: activityId,
      id_lte: activityId,
      user_id: userId,
      ownReactions: true,
      withOwnReactions: true,
      withReactionCounts: true,
    });

    return activity.results[0];
  }

  /**
   * Returns basic details of an activity.
   *
   * @param {string} activityId
   */
  async getActivity(activityId: string) {
    try {
      const { results } = await this.getStreamClient.getActivities({
        ids: [activityId],
      });

      return results[0];
    } catch (e) {
      throw new ServiceException('Activity not found', ExceptionsEnum.NotFound);
    }
  }

  /**
   * Checks if user has liked an activity.
   *
   * @param {UserHasReactionOnActivityOptions} options
   * @param {ReactionAPIResponse<UR>[]} carry
   * @param {string} afterId
   * @returns {Promise<string | null>} Returns the ID of the reaction.
   */
  async getUserReactionOnActivity(
    options: UserHasReactionOnActivityOptions,
    carry: ReactionAPIResponse<UR>[] = [],
    afterId?: string,
  ): Promise<ReactionAPIResponse<UR> | null> {
    const filter: ReactionFilterConditions = {
      user_id: options.userId,
    };

    if (afterId) {
      filter.id_lt = afterId;
    }

    const { results, next } = await this.getStreamClient.reactions.filter(
      filter,
    );

    const userReactionsOnActivity = results.filter(
      (reaction) =>
        reaction.activity_id === options.activityId &&
        reaction.kind !== ReactionsTypes.COMMENT,
    );
    const hasReaction = userReactionsOnActivity.length > 0;

    if (hasReaction) {
      return userReactionsOnActivity[0];
    }

    const reactions = [...carry, ...results];

    if (next) {
      const lastReaction = reactions[reactions.length - 1];

      return this.getUserReactionOnActivity(
        options,
        reactions,
        lastReaction.id,
      );
    }

    return null;
  }

  /**
   * Removes all followers of a feed, unfollows all followed feeds.
   *
   * @param {FeedGroup} feedGroup
   * @param {string} feedId
   * @returns {Promise<void>}
   */
  async deleteAllFeedData(feedGroup: FeedGroup, feedId: string) {
    await this.unfollowAllFollowing(feedGroup, feedId);
    await this.removeAllFollowers(feedGroup, feedId);
    await this.deleteFeed(feedGroup, feedId);
  }

  /**
   * Unfollow all feeds that are followed by other feed.
   *
   * @param {FeedGroup} feedGroup
   * @param {string} feedId
   * @returns {Promise<void>}
   */
  async unfollowAllFollowing(feedGroup: FeedGroup, feedId: string) {
    const following = await this.getAllFollowingFromFeed(feedGroup, feedId);

    const unfollowBatch = following.map((following) => {
      const { feed_id: target } = following;
      const source = `${feedGroup}:${feedId}`;

      return { source, target };
    });

    await this.getStreamClient.unfollowMany(unfollowBatch);
  }

  /**
   * Removes all followers of a feed.
   *
   * @param {FeedGroup} feedGroup
   * @param {string} feedId
   * @returns {Promise<void>}
   */
  async removeAllFollowers(feedGroup: FeedGroup, feedId: string) {
    const followers = await this.getAllFollowersFromFeed(feedGroup, feedId);
    const unfollowBatch = followers.map((follower) => {
      const { feed_id: source } = follower;
      const target = `${feedGroup}:${feedId}`;

      return { source, target };
    });

    await this.getStreamClient.unfollowMany(unfollowBatch);
  }

  /**
   * Deletes a feed.
   *
   * @param {FeedGroup} feedGroup
   * @param {string} feedId
   */
  async deleteFeed(feedGroup: FeedGroup, feedId: string) {
    const token = await this.getStreamClient.getOrCreateToken();
    const url = `feed/${feedGroup}/${feedId}/`;

    await this.getStreamClient.delete({ url, token });
  }

  /**
   * Returns all feeds that follows a feed.
   *
   * @param {FeedGroup} feedGroup
   * @param {string} feedId
   * @param {any[]} carry
   * @returns {Promise<any[]>}
   */
  async getAllFollowersFromFeed(
    feedGroup: FeedGroup,
    feedId: string,
    carry: any[] = [],
  ) {
    return this.getRecursiveFollowList('followers', feedGroup, feedId, carry);
  }

  /**
   * Returns all feeds that are followed by a feed.
   *
   * @param {FeedGroup} feedGroup
   * @param {string} feedId
   * @param {any[]} carry
   * @returns {Promise<any[]>}
   */
  async getAllFollowingFromFeed(
    feedGroup: FeedGroup,
    feedId: string,
    carry: any[] = [],
  ) {
    return this.getRecursiveFollowList('following', feedGroup, feedId, carry);
  }

  /**
   * Recursively gets all feeds that are followed or following by a feed.
   *
   * @param {string} vector
   * @param {FeedGroup} feedGroup
   * @param {string} feedId
   * @param {any[]} carry
   * @returns {Promise<any[]>}
   */
  private async getRecursiveFollowList(
    vector: 'followers' | 'following',
    feedGroup: FeedGroup,
    feedId: string,
    carry: any[] = [],
  ): Promise<
    {
      created_at: string;
      feed_id: string;
      target_id: string;
      updated_at: string;
    }[]
  > {
    const feed = this.getStreamClient.feed(feedGroup, feedId);
    const { results } = await feed[vector]({
      limit: 100,
    });

    const followers = [...carry, ...results];
    const hasNext = results.length === 100;

    if (hasNext) {
      return this.getRecursiveFollowList(vector, feedGroup, feedId, followers);
    }

    return followers;
  }
}

export default GetStreamService;
