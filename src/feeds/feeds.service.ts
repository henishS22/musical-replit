import { Injectable, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import {
  ActivityResult,
  ChangeReactionResult,
  CommentResult,
  FeedGroup,
  GetActivitiesOptions,
  NewActivity,
} from './helper/utils/types';
import {
  ExceptionsEnum,
  ProjectActivityTypeEnum,
  ReactionsTypes,
  SocialActivityTypeEnum,
} from './helper/utils/enums';
import { GetStreamService } from './helper/services/getStream.service';
import { ProjectDocument } from './helper/schemas/project.schema';
import { UserDocument } from './helper/schemas/user.schema';
import { TrackDocument } from './helper/schemas/track.schema';
import { Model } from 'mongoose';
import {
  Collaboration,
  Project,
  Release,
  ReleaseDocument,
  Track,
  User,
} from '../schemas/schemas';
import { InjectModel } from '@nestjs/mongoose';
// import { ReleaseDocument } from './helper/schemas/release.schema';
import { CollaborationDocument } from './helper/schemas/collaboration.schema';
import { getArtworkImageName } from './helper/utils/functions';
import ServiceException from './helper/exceptions/ServiceException';
import { NotificationsService } from './helper/services/notifications.service';
import { lastValueFrom } from 'rxjs';

type ReactionsFilter = {
  type?: ReactionsTypes;
  afterId?: string;
  limit?: number;
};

@Injectable()
export class FeedsService {
  constructor(private readonly getStreamService: GetStreamService) {}
  private readonly notificationsService: NotificationsService;
  @InjectModel(Project.name)
  private readonly projectsModel: Model<ProjectDocument>;
  @InjectModel(User.name) private readonly usersModel: Model<UserDocument>;
  @InjectModel(Track.name) private readonly tracksModel: Model<TrackDocument>;
  @InjectModel(Release.name)
  private readonly releasesModel: Model<ReleaseDocument>;
  @InjectModel(Collaboration.name)
  private readonly collaborationsModel: Model<CollaborationDocument>;

  //Define the microservice to connect
  /**
   * Returns the activities of a feed.
   *
   * @param {string} userId
   * @param {GetActivitiesOptions} options
   * @returns {Promise<ActivityResult[]>}
   */
  async getUserFeedActivities(
    userId: string,
    options: GetActivitiesOptions,
  ): Promise<{ activities: ActivityResult[]; nextPage: null | string }> {
    const { results: rawActivities, next } =
      await this.getStreamService.getFeedActivities(userId, options);
    const hasNextPage = !!next;

    const activitiesPromises = rawActivities.map((activity) => {
      const { verb, target } = activity;
      const hasInvalidType =
        options.types?.length && !options.types.includes(verb);

      const [targetFeedType, targetId] = target?.split(':');
      const isJoinActivity =
        verb === SocialActivityTypeEnum.INVITED_USER_JOINED;
      const userIsTarget = targetFeedType === 'user' && targetId === userId;
      const cantSeeJoinActivity = isJoinActivity && !userIsTarget; // Only who invited can see the join activity

      if (cantSeeJoinActivity || hasInvalidType) {
        return Promise.resolve(null);
      }

      return this.populateActivity(activity);
    });

    const activities = await Promise.all(activitiesPromises);

    // Invalid activities are null.
    // We filter them out and search for more activities to fill.
    // If there are no more activities, we return the ones we have.
    const invalidActivities = activities.filter((activity) => !activity);
    const hasInvalidActivities = !!invalidActivities.length;
    const validActivities = activities.filter((activity) => activity !== null);

    const activitiesToFill = (hasInvalidActivities &&
      hasNextPage &&
      (await this.getUserFeedActivities(userId, {
        afterId: rawActivities[rawActivities.length - 1].id,
        limit: invalidActivities.length,
        types: options.types,
      }))) || { activities: [], nextPage: null };

    const allActivities = [...validActivities, ...activitiesToFill?.activities];

    const lastActivity = allActivities[allActivities.length - 1];
    const nextPage =
      (!hasInvalidActivities && hasNextPage) ||
      (hasInvalidActivities && activitiesToFill.nextPage)
        ? lastActivity?.id
        : null;

    return {
      activities: allActivities,
      nextPage,
    };
  }

  /**
   * Returns data from a single activity.
   *
   * @param {string} activityId
   * @param {?string} userId
   * @returns {Promise<ActivityResult>}
   */
  async getActivity(
    activityId: string,
    userId?: string,
  ): Promise<ActivityResult> {
    const activity = await this.getStreamService.getActivityDetail(
      activityId,
      userId,
    );
    const populatedActivity = await this.populateActivity(activity);

    return populatedActivity;
  }

  /**
   * Retrieve reactions from an activity.
   *
   * @param {string} activityId
   * @param {ReactionsFilter} param1
   * @returns
   */
  async getActivityReactions(
    activityId: string,
    { type, afterId, limit }: ReactionsFilter,
  ) {
    const { results: rawReactions, next } =
      await this.getStreamService.getSimpleReactions(activityId, {
        type,
        afterId,
        limit,
      });
    const hasNextPage = !!next;
    const lastActivity = rawReactions[rawReactions.length - 1];
    const nextPage = hasNextPage ? lastActivity?.id : null;

    const reactionsPromises = rawReactions.map(async (reaction) => {
      const {
        id,
        user_id: userId,
        data,
        kind: type,
        created_at: time,
      } = reaction;
      const user = await this.usersModel
        .findById(userId)
        .select('name profile_img');

      return {
        id,
        user,
        type,
        data,
        time,
      };
    });
    const reactions = await Promise.all(reactionsPromises);

    return {
      reactions,
      nextPage,
    };
  }

  /**
   * Returns basic info of a project.
   *
   * @param {string} projectId
   * @returns {Promise<ProjectDocument | null>}
   */
  private async getProject(projectId: string) {
    const rawProject = await this.projectsModel
      .findById(projectId)
      .select('name artworkExension')
      .populate({
        path: 'user',
        select: 'name profile_img',
      })
      .populate({
        path: 'collaborators',
        select: { user: 1 },
        populate: {
          path: 'user',
          model: 'User',
          select: { name: 1, profile_img: 1 },
        },
      });

    if (!rawProject) {
      return null;
    }

    const project = JSON.parse(JSON.stringify(rawProject));

    if (!project.artworkUrl) {
      //Add get url to a try catch
      let projectUrl: any;

      try {
        projectUrl = await this.getImageUrl(
          getArtworkImageName({
            id: project._id.toString(),
            extension: project.artworkExension,
          }),
        );
      } catch (error) {
        projectUrl = null;
      }

      if (projectUrl) {
        project.artworkUrl = projectUrl;
      }
    }

    return project;
  }

  /**
   * Follows a feed.
   *
   * @param {string} follower
   * @param {string} feedId
   * @param {string} feedGroup
   * @returns {Promise<void>}
   */
  followFeed(follower: string, feedId: string, feedGroup: string) {
    this.getStreamService.followFeed(
      {
        feedGroup: 'user',
        feedId: follower,
      },
      {
        feedGroup,
        feedId,
      },
    );
  }

  /**
   * Unfollows a feed.
   *
   * @param {string} follower
   * @param {string} feedId
   * @param {string} feedGroup
   * @returns {Promise<void>}
   */
  unfollowFeed(follower: string, feedId: string, feedGroup: string) {
    return this.getStreamService.unfollowFeed(
      {
        feedGroup: 'user',
        feedId: follower,
      },
      {
        feedGroup,
        feedId,
      },
    );
  }

  /**
   * Creates an activity when a user add a comment to a project.
   *
   * @param {string} projectId
   * @param {string} userId
   * @param {string} comment
   */
  async addAddedCommentToProjectActivity(
    projectId: string,
    userId: string,
    comment: string,
  ) {
    await this.createProjectActivity(
      projectId,
      userId,
      comment,
      ProjectActivityTypeEnum.ADDED_A_COMMENT_ON_A_PROJECT,
    );
  }

  /**
   * Creates an activity when a track is added to a project library.
   *
   * @param {string} projectId
   * @param {string} userId
   * @param {string[]} tracks
   */
  async addAddedTracksToProjectActivity(
    projectId: string,
    userId: string,
    tracks: string[],
  ) {
    const notFoundTracks = await this.getNotFoundTracks(tracks);
    const hasNotFoundTracks = notFoundTracks.length > 0;

    if (hasNotFoundTracks) {
      throw new ServiceException(
        `One or more tracks not found: ${notFoundTracks.join(', ')}`,
        ExceptionsEnum.NotFound,
      );
    }

    await this.createProjectActivity(
      projectId,
      userId,
      tracks,
      ProjectActivityTypeEnum.ADDED_TRACKS_TO_PROJECT,
    );
  }

  /**
   * Creates an activity when a track is added to a release.
   *
   * @param {string} projectId
   * @param {string} releaseId
   * @param {string} userId
   * @param {string[]} tracks
   */
  async addAddedTracksToReleaseActivity(
    projectId: string,
    releaseId: string,
    userId: string,
    tracks: string[],
  ) {
    await this.createProjectReleaseActivity(
      projectId,
      releaseId,
      userId,
      tracks,
      ProjectActivityTypeEnum.ADDED_TRACKS_TO_RELEASE,
    );
  }

  /**
   * Creates an activity when a track is added to a final version.
   *
   * @param {string} projectId
   * @param {string} releaseId
   * @param {string} userId
   * @param {string[]} tracks
   */
  async addAddedTracksToFinalVersionActivity(
    projectId: string,
    releaseId: string,
    userId: string,
    tracks: string[],
  ) {
    await this.createProjectReleaseActivity(
      projectId,
      releaseId,
      userId,
      tracks,
      ProjectActivityTypeEnum.ADDED_TRACKS_TO_FINAL_VERSION,
    );
  }

  /**
   * Creates an activity when a user creates an collaboration opportunity.
   *
   * @param {string} collabId
   * @param {string} userId
   */
  async addCreatedCollaborationOpportunity(collabId: string, userId: string) {
    const collab = await this.collaborationsModel.findById(collabId);

    if (!collab) {
      return;
    }

    const feedSlug: FeedGroup = 'user';
    const feedId = userId;
    const activity: NewActivity = {
      actor: `user:${userId}`,
      verb: ProjectActivityTypeEnum.CREATED_COLLABORATION_OPPORTUNITY,
      target: `user:${userId}`,
      object: collabId,
    };

    await this.getStreamService.createActivity(activity, feedSlug, feedId);
  }

  async addInvitedUserJoined(inviterId: string, userId: string): Promise<void> {
    const feedSlug: FeedGroup = 'user';
    const feedId = inviterId;
    const activity: NewActivity = {
      actor: `user:${userId}`,
      verb: SocialActivityTypeEnum.INVITED_USER_JOINED,
      target: `user:${inviterId}`,
      object: userId,
    };

    await this.getStreamService.createActivity(activity, feedSlug, feedId);
  }

  /**
   * Adds a comment to an activity.
   *
   * @param {string} comment
   * @param {string} activityId
   * @param {string} userId
   * @returns {Promise<CommentResult>}
   */
  async commentOnActivity(
    comment: string,
    activityId: string,
    userId: string,
  ): Promise<CommentResult> {
    const result = await this.getStreamService.addComment(
      comment,
      activityId,
      userId,
    );

    this.sendCommentNotification({
      activityId,
      comment,
      userId,
      commentId: result.id,
    });

    return {
      id: result.id,
      userId: result.user_id,
      comment,
      activityId: result.activity_id,
      time: result.created_at,
    };
  }

  /**
   * Deletes a comment from an activity.
   *
   * @param {string} reactionId
   * @returns {object}
   */
  async deleteComment(reactionId: string) {
    await this.getStreamService.deleteComment(reactionId);

    this.notificationsService.deleteNotificationsOfComments(reactionId);

    return {
      deleted: true,
    };
  }

  /**
   * Adds like reaction to an activity.
   *
   * @param {string} activityId
   * @param {string} userId
   */
  async changeReactionOnActivity(
    activityId: string,
    userId: string,
    type?: ReactionsTypes,
  ): Promise<ChangeReactionResult> {
    const result = await this.getStreamService.changeSimpleReaction(
      activityId,
      userId,
      type,
    );

    if (result.reaction) {
      this.sendReactionNotification({
        activityId,
        userId,
        reactionId: result.id,
        type,
      });

      return {
        id: result.id,
        userId: result.user_id,
        activityId: result.activity_id,
        time: result.created_at,
        reaction: result.reaction,
      };
    }

    return {
      reaction: null,
    };
  }

  private async populateActivity(activity: any): Promise<ActivityResult> {
    const {
      id,
      actor,
      verb,
      object,
      target,
      release: releaseId,
      time,
      reaction_counts,
      own_reactions,
    } = activity;
    const [actorType, actorId] = actor.split(':');
    const [targetType, targetId] = target.split(':');

    let actorObject: null | UserDocument;
    let targetObject: null | ProjectDocument;
    let resource: any;
    const extra: {
      release?: ReleaseDocument;
    } = {};

    if (actorType === 'user') {
      actorObject = await this.usersModel
        .findById(actorId)
        .select('name profile_img');

      if (!actorObject) {
        return null;
      }
    }

    if (targetType === 'project') {
      targetObject = await this.getProject(targetId);

      if (!targetObject) {
        return null;
      }
    }

    if (verb === ProjectActivityTypeEnum.CREATED_COLLABORATION_OPPORTUNITY) {
      const rawCollab = await this.collaborationsModel
        .findById(object)
        .populate({
          path: 'userId',
          select: 'name profile_img',
        })
        .populate({
          path: 'seeking',
        })
        .populate({
          path: 'skillsOffered',
        })
        .populate({
          path: 'styles',
        })
        .populate({
          path: 'track',
        })
        .select({
          __v: 0,
        });

      if (!rawCollab) {
        return null;
      }

      const collab = JSON.parse(JSON.stringify(rawCollab));
      const fileName = `${collab._id.toString()}_collab_artwork.${
        collab.artworkExtension
      }`;
      collab.artworkUrl = await this.getImageUrl(fileName);

      resource = collab;
    }

    const verbsWithTracks = [
      ProjectActivityTypeEnum.ADDED_TRACKS_TO_PROJECT,
      ProjectActivityTypeEnum.ADDED_TRACKS_TO_RELEASE,
      ProjectActivityTypeEnum.ADDED_TRACKS_TO_FINAL_VERSION,
    ];

    if (verbsWithTracks.includes(verb)) {
      const tracksIds = JSON.parse(object);
      resource = await this.getTracksById(tracksIds);
    }

    if (verb === ProjectActivityTypeEnum.ADDED_A_COMMENT_ON_A_PROJECT) {
      resource = object;
    }

    if (verb === ProjectActivityTypeEnum.ADDED_TRACKS_TO_RELEASE) {
      const release = await this.releasesModel
        .findById(releaseId)
        .select('name');

      if (!release) {
        return null;
      }

      extra.release = release;
    }

    return {
      id,
      actor: actorObject,
      target: targetObject,
      resource,
      time,
      type: verb,
      extra,
      reaction_counts,
      own_reactions,
    };
  }

  private async sendCommentNotification({
    activityId,
    userId,
    comment,
    commentId,
  }: {
    activityId: string;
    userId: string;
    comment: string;
    commentId: string;
  }) {
    const actorId = await this.getActivityActor(activityId);

    if (!actorId) {
      return;
    }

    const targetIsNotTheActivityOwner = actorId !== userId;

    if (targetIsNotTheActivityOwner) {
      this.notificationsService.registerCommentedOnActivity(
        activityId,
        userId,
        commentId,
        comment,
        actorId,
      );
    }
  }

  deleteProjectFeed(projectId: string) {
    return this.getStreamService.deleteAllFeedData('project', projectId);
  }

  deleteUserFeed(userId: string) {
    return this.getStreamService.deleteAllFeedData('user', userId);
  }

  private async sendReactionNotification({
    activityId,
    userId,
    type,
    reactionId,
  }: {
    activityId: string;
    userId: string;
    reactionId: string;
    type: ReactionsTypes;
  }) {
    const actorId = await this.getActivityActor(activityId);

    if (!actorId) {
      return;
    }

    const targetIsNotTheActivityOwner = actorId !== userId;

    if (targetIsNotTheActivityOwner) {
      this.notificationsService.registerReactedToActivity(
        activityId,
        userId,
        reactionId,
        type,
        actorId,
      );
    }
  }

  private async getActivityActor(activityId: string): Promise<string | null> {
    const activity = await this.getStreamService.getActivity(activityId);

    if (!activity) {
      return null;
    }

    const { actor } = activity;
    const [, actorId] = (actor as string).split(':');

    return actorId;
  }

  private async createProjectReleaseActivity(
    projectId: string,
    releaseId: string,
    userId: string,
    tracks: string[],
    type: ProjectActivityTypeEnum,
  ) {
    const release = await this.releasesModel.findById(releaseId);

    if (!release) {
      throw new ServiceException(
        `Release not found: ${releaseId}`,
        ExceptionsEnum.NotFound,
      );
    }

    const notFoundTracks = await this.getNotFoundTracks(tracks);
    const hasNotFoundTracks = notFoundTracks.length > 0;

    if (hasNotFoundTracks) {
      throw new ServiceException(
        `One or more tracks not found: ${notFoundTracks.join(', ')}`,
        ExceptionsEnum.NotFound,
      );
    }

    await this.createProjectActivity(projectId, userId, tracks, type, {
      release: releaseId,
    });
  }

  private async createProjectActivity(
    projectId: string,
    userId: string,
    object: any,
    type: ProjectActivityTypeEnum,
    extra: object = {},
  ) {
    const project = await this.projectsModel.findById(projectId);

    if (!project) {
      throw new ServiceException('Project not found', ExceptionsEnum.NotFound);
    }

    const feedSlug: FeedGroup = 'project';
    const feedId = projectId;
    const activity: NewActivity = {
      actor: `user:${userId}`,
      verb: type,
      object,
      target: `project:${projectId}`,
      ...extra,
    };

    await this.getStreamService.createActivity(activity, feedSlug, feedId);
  }

  private async getNotFoundTracks(tracks: string[]) {
    const notFoundTracksIdsPromises = tracks.map(async (trackId) => {
      const trackExists = await this.tracksModel.findById(trackId);

      if (!trackExists) {
        return trackId;
      }

      return null;
    });
    const notFoundTrackIds = await Promise.all(notFoundTracksIdsPromises);

    return notFoundTrackIds.filter((track) => !!track);
  }

  private getTracksById(tracks: string[]) {
    return this.tracksModel
      .find({
        _id: {
          $in: tracks,
        },
      })
      .select('name');
  }

  //fix that kafka issue
  private async getImageUrl(name: string): Promise<null | string> {
    // const resultArray = await lastValueFrom(
    // this.clientKafka.send(
    //   StorageDefinedExternalTopics.storageGetImageUrl.topic,
    //   {
    //     name,
    //   },
    // ),
    // );

    return null;
  }
}
