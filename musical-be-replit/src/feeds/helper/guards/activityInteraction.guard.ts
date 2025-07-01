import ServiceException from '../exceptions/ServiceException';

import { ExceptionsEnum } from '../utils/enums';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  mixin,
  Type,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import { Project } from '../schemas/project.schema';
import { GetStreamService } from '../services/getStream.service';

export const ActivityInteractionGuard = (): Type<any> => {
  class ActivityInteractionGuardMixin implements CanActivate {
    constructor(
      @Inject(GetStreamService)
      private readonly getStreamService: GetStreamService,
      @InjectModel(Project.name) private readonly projectModel: Model<Project>,
    ) {}

    canActivate(
      context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
      console.log(context.getArgs()[0], '----context.getArgs()[0]?.value----');
      const { owner, activityId } = context.getArgs()[0]?.value;

      return this.userCanInteractWithActivity(activityId, owner);
    }

    /**
     * Checks if user can interact with activity.
     *
     * @param {string} activityId
     * @param {string} userId
     * @returns {Promise<boolean>}
     */
    private async userCanInteractWithActivity(
      activityId: string,
      userId: string,
    ): Promise<boolean> {
      const activity = await this.getStreamService.getActivity(activityId);

      if (!activity) {
        return false;
      }

      const feedOfActivity = await this.getStreamService.getFeedOfActivity(
        activity,
      );

      if (!feedOfActivity) {
        return false;
      }

      const [feedGroup, feedId] = feedOfActivity;

      if (feedGroup === 'project') {
        return await this.isPartOfProject(feedId, userId);
      }

      const isFeedOwner = this.userIdFeedOwner(feedId, feedGroup, userId);

      if (isFeedOwner) {
        return true;
      }

      return await this.getStreamService.userFollowsFeed(
        userId,
        feedId,
        feedGroup,
      );
    }

    private userIdFeedOwner(feedId: string, feedGroup: string, userId: string) {
      return feedId === userId && feedGroup === 'user';
    }

    /**
     * Checks if user is owner or collaborator of a project.
     *
     * @param {string} projectId
     * @param {string} userId
     * @returns {Promise<boolean>}
     */
    private async isPartOfProject(
      projectId: string,
      userId: string,
    ): Promise<boolean> {
      const project = await this.projectModel.findById(projectId);

      if (!project) {
        throw new ServiceException(
          'Activity not found.',
          ExceptionsEnum.NotFound,
        );
      }

      const isOwnerOfProject = project.user.toString() === userId;

      if (isOwnerOfProject) {
        return true;
      }

      const isCollaboratorOfProject = project.collaborators?.some(
        (collaborator) => collaborator.user?.toString() === userId,
      );

      return isCollaboratorOfProject;
    }
  }

  const guard = mixin(ActivityInteractionGuardMixin);

  return guard;
};
