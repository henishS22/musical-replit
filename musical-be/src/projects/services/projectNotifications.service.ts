import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { Project, ProjectDocument, User } from '@/src/schemas/schemas';
import { Collaborator, ForeignKeyField } from '../utils/types';
import { NotifiesService } from '@/src/notifies/notifies.service';

@Injectable()
export class ProjectNotifyService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @Inject(NotifiesService) private readonly notifiesService: NotifiesService,
  ) {}

  async registerNewTrackOnMainFolder(
    projectId: ObjectId,
    authorId: ObjectId,
    trackIds: ObjectId[],
  ) {
    const project = await this.projectModel.findById(projectId);
    const targets = this.getTarget(project, authorId);

    await Promise.all(
      targets.map(async (target) => {
        this.notifiesService.addTrackProject({
          projectId: projectId?.toString(),
          fromUserId: authorId?.toString(),
          toUserId: target?.toString(),
          trackIds: trackIds?.map((trackId) => trackId?.toString()),
        });
      }),
    );
  }

  async registerAddCollaboratorToProject({
    projectId,
    authorId,
    collaboratorName,
  }: {
    projectId: ObjectId;
    authorId: ObjectId;
    collaboratorName: string;
  }) {
    const project = await this.projectModel.findById(projectId);
    const targets = this.getTarget(project, authorId);

    await Promise.all(
      targets.map(async (target) => {
        this.notifiesService.addCollaboratorToProject({
          projectId: projectId?.toString(),
          fromUserId: authorId?.toString(),
          toUserId: target?.toString(),
          collaboratorName,
        });
      }),
    );
  }

  async registerRemoveCollaboratorFromProject({
    projectId,
    authorId,
    collaboratorName,
  }: {
    projectId: ObjectId;
    authorId: ObjectId;
    collaboratorName: string;
  }) {
    const project = await this.projectModel.findById(projectId);
    const targets = this.getTarget(project, authorId);

    await Promise.all(
      targets.map(async (target) => {
        this.notifiesService.removeCollaboratorFromProject({
          projectId: projectId?.toString(),
          fromUserId: authorId?.toString(),
          toUserId: target?.toString(),
          collaboratorName,
        });
      }),
    );
  }

  async registerAddedTracksToRelease(
    projectId: ObjectId,
    releaseId: ObjectId,
    authorId: ObjectId,
    trackIds: ObjectId[],
  ) {
    const project = await this.projectModel.findById(projectId);
    const targets = this.getTarget(project, authorId);

    await Promise.all(
      targets.map(async (target) => {
        this.notifiesService.addAddedTracksToRelease({
          projectId: projectId?.toString(),
          fromUserId: authorId?.toString(),
          toUserId: target?.toString(),
          trackIds: trackIds?.map((trackId) => trackId?.toString()),
          releaseId: releaseId?.toString(),
        });
      }),
    );
  }

  async registerRemovedTracksFromRelease(
    projectId: ObjectId,
    releaseId: ObjectId,
    authorId: ObjectId,
    trackIds: ObjectId[],
  ) {
    const project = await this.projectModel.findById(projectId);
    const targets = this.getTarget(project, authorId);

    await Promise.all(
      targets.map(async (target) => {
        this.notifiesService.addRemovedTracksFromRelease({
          projectId: projectId?.toString(),
          releaseId: releaseId?.toString(),
          fromUserId: authorId?.toString(),
          trackIds: trackIds?.map((trackId) => trackId?.toString()),
          toUserId: target?.toString(),
        });
      }),
    );
  }

  async registerAddedTracksToFinalVersion(
    projectId: ObjectId,
    releaseId: ObjectId,
    authorId: ObjectId,
    trackIds: ObjectId[],
  ) {
    const project = await this.projectModel.findById(projectId);
    const targets = this.getTarget(project, authorId);

    await Promise.all(
      targets.map(async (target) => {
        this.notifiesService.addAddedTracksToFinalVersion({
          projectId: projectId?.toString(),
          releaseId: releaseId?.toString(),
          fromUserId: authorId?.toString(),
          trackIds: trackIds?.map((trackId) => trackId?.toString()),
          toUserId: target?.toString(),
        });
      }),
    );
  }

  async registerRemovedTracksFromFinalVersion(
    projectId: ObjectId,
    releaseId: ObjectId,
    authorId: ObjectId,
    trackIds: ObjectId[],
  ) {
    const project = await this.projectModel.findById(projectId);
    const targets = this.getTarget(project, authorId);

    await Promise.all(
      targets.map(async (target) => {
        this.notifiesService.addRemovedTracksFromFinalVersion({
          projectId: projectId?.toString(),
          releaseId: releaseId?.toString(),
          fromUserId: authorId?.toString(),
          trackIds: trackIds?.map((trackId) => trackId?.toString()),
          toUserId: target?.toString(),
        });
      }),
    );
  }

  async registerCommentedOnProject(
    projectId: ObjectId,
    comment: string,
    authorId: ObjectId,
  ) {
    const project = await this.projectModel.findById(projectId);
    const targets = this.getTarget(project, authorId);

    await Promise.all(
      targets.map(async (target) => {
        this.notifiesService.addCommentedOnAProject({
          projectId: projectId?.toString(),
          comment,
          fromUserId: authorId?.toString(),
          toUserId: target?.toString(),
        });
      }),
    );
  }

  async registerUpdatedSplits(
    projectId: ObjectId,
    authorId: ObjectId,
    releaseId: ObjectId,
  ) {
    const project = await this.projectModel.findById(projectId);
    const targets = this.getTarget(project, authorId);

    await Promise.all(
      targets.map(async (target) => {
        this.notifiesService.addUpdatedReleaseSplits({
          projectId: projectId?.toString(),
          fromUserId: authorId?.toString(),
          releaseId: releaseId?.toString(),
          toUserId: target?.toString(),
        });
      }),
    );
  }

  async registerAnsweredContractSplit(
    projectId: ObjectId,
    authorId: ObjectId,
    releaseId: ObjectId,
    accepted: boolean,
  ) {
    const project = await this.projectModel.findById(projectId);
    const targets = this.getTarget(project, authorId);

    await Promise.all(
      targets.map(async (target) => {
        this.notifiesService.addUserAnsweredContractSplit({
          projectId: projectId?.toString(),
          fromUserId: authorId?.toString(),
          releaseId: releaseId?.toString(),
          toUserId: target?.toString(),
          accepted: String(accepted),
        });
      }),
    );
  }

  async deleteProjectNotifications({
    projectId,
  }: {
    projectId: ObjectId | string;
  }) {
    const res = await this.notifiesService.deleteProjectNotifications({
      projectId: projectId?.toString(),
    });

    return res;
  }

  /**
   * Returns the target user for the notification.
   * @param {Project} project
   * @param {ObjectId} authorId
   * @returns {ObjectId[]}
   */
  private getTarget(project: Project, authorId: ForeignKeyField<User>) {
    const projectCollaborators = project.collaborators
      .filter((collaborator) => !collaborator.invitedForProject)
      .map((collaborator: Collaborator) => collaborator.user.toString());
    const projectOwner = project.user.toString();
    const userIsCollaborator = projectCollaborators.includes(
      authorId.toString(),
    );
    const target = userIsCollaborator
      ? [
          projectOwner,
          ...projectCollaborators.filter(
            (user) => user?.toString() !== authorId?.toString(),
          ),
        ]
      : projectCollaborators;

    // If author is the owner, send only to collaborators, otherwise send for
    //  other collaborators and the owner
    return target;
  }
}
