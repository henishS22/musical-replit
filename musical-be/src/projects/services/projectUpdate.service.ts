import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { Project, ProjectDocument, ProjectUpdate } from '@/src/schemas/schemas';
import { ProjectUpdateEnum } from '../../utils/enums';
import { CreateProjectUpdate } from '../utils/types';
import { FeedsService } from './feeds.service';
import { ProjectNotifyService } from './projectNotifications.service';

@Injectable()
export class ProjectUpdateService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    private notificationsService: ProjectNotifyService,
    private feedsService: FeedsService,
  ) {}

  async createAddedFilesToFinalRelease(
    project: ObjectId,
    release: ObjectId,
    tracks: ObjectId[],
    userId: ObjectId,
  ): Promise<ProjectDocument> {
    return await this.create({
      type: ProjectUpdateEnum.ADDED_FILES_TO_FINAL_VERSION,
      info: { tracks },
      project,
      release,
      userId,
    });
  }

  async createRemovedFilesFromFinalRelease(
    project: ObjectId,
    release: ObjectId,
    tracks: ObjectId[],
    userId: ObjectId,
  ): Promise<ProjectDocument> {
    return await this.create({
      type: ProjectUpdateEnum.REMOVED_FILES_FROM_FINAL_VERSION,
      info: { tracks },
      project,
      release,
      userId,
    });
  }

  async createAddedFilesToMainFolder(
    project: ObjectId,
    tracks: ObjectId[],
    userId: ObjectId,
  ) {
    return await this.create({
      type: ProjectUpdateEnum.ADDED_FILES_TO_MAIN_FOLDER,
      info: { tracks },
      project,
      userId,
    });
  }

  async createAddedFilesToRelease(
    project: ObjectId,
    release: ObjectId,
    tracks: ObjectId[],
    userId: ObjectId,
  ): Promise<ProjectDocument> {
    return await this.create({
      type: ProjectUpdateEnum.ADDED_FILES_TO_RELEASE,
      info: { tracks },
      project,
      release,
      userId,
    });
  }

  async createRemovedFilesFromRelease(
    project: ObjectId,
    release: ObjectId,
    tracks: ObjectId[],
    userId: ObjectId,
  ): Promise<ProjectDocument> {
    return await this.create({
      type: ProjectUpdateEnum.REMOVED_FILES_FROM_RELEASE,
      info: { tracks },
      project,
      release,
      userId,
    });
  }

  async createComment(
    project: ObjectId,
    comment: string,
    userId: ObjectId,
  ): Promise<ProjectDocument> {
    return await this.create({
      type: ProjectUpdateEnum.COMMENT,
      info: {
        comment,
      },
      project,
      userId,
    });
  }

  async createRenamedProject(
    project: ObjectId,
    oldName: string,
    newName: string,
    userId: ObjectId,
  ): Promise<ProjectDocument> {
    return await this.create({
      type: ProjectUpdateEnum.RENAMED_PROJECT,
      info: {
        oldName,
        newName,
      },
      project,
      userId,
    });
  }

  async createPublishedRelease(
    project: ObjectId,
    release: ObjectId,
    userId: ObjectId,
  ): Promise<ProjectDocument> {
    return await this.create({
      type: ProjectUpdateEnum.PUBLISHED_RELEASE,
      info: {},
      project,
      release,
      userId,
    });
  }

  async createCreatedRelease(
    project: ObjectId,
    release: ObjectId,
    userId: ObjectId,
  ): Promise<ProjectDocument> {
    return await this.create({
      type: ProjectUpdateEnum.CREATED_RELEASE,
      info: {},
      project,
      release,
      userId,
    });
  }

  async createRenamedRelease(
    project: ObjectId,
    release: ObjectId,
    oldName: string,
    newName: string,
    userId: ObjectId,
  ): Promise<ProjectDocument> {
    return await this.create({
      type: ProjectUpdateEnum.RENAMED_RELEASE,
      info: {
        oldName,
        newName,
      },
      project,
      release,
      userId,
    });
  }

  async createCreatedProject(
    project: ObjectId,
    userId: ObjectId,
  ): Promise<ProjectDocument> {
    return await this.create({
      type: ProjectUpdateEnum.CREATED_PROJECT,
      info: {},
      project,
      userId,
    });
  }

  async createUnlinkedTracksFromMainFolder(
    project: ObjectId,
    tracks: ObjectId,
    userId: ObjectId,
  ): Promise<ProjectDocument> {
    return await this.create({
      type: ProjectUpdateEnum.UNLINKED_FILES_FROM_MAIN_FOLDER,
      info: { tracks },
      project,
      userId,
    });
  }

  /**
   * Creates a project update for be shown on timeline.
   *
   * @param param0
   */
  async create({
    type,
    info,
    project: projectId,
    release,
    userId,
  }: CreateProjectUpdate) {
    // Follow the https://visionnaire.atlassian.net/wiki/spaces/MUSICALOUT/pages/1052599713793/Notifications rules
    const updateDoc = new ProjectUpdate();
    updateDoc.type = type;
    updateDoc.user = userId;
    updateDoc.createdAt = new Date();

    const project = await this.projectModel.findById(projectId);

    if (type === ProjectUpdateEnum.ADDED_FILES_TO_FINAL_VERSION) {
      await this.notificationsService.registerAddedTracksToFinalVersion(
        projectId,
        release,
        userId,
        info.tracks,
      );

      updateDoc.info = info;
      updateDoc.release = release;
    }

    if (type === ProjectUpdateEnum.REMOVED_FILES_FROM_FINAL_VERSION) {
      await this.notificationsService.registerRemovedTracksFromFinalVersion(
        projectId,
        release,
        userId,
        info.tracks,
      );

      updateDoc.info = info;
      updateDoc.release = release;
    }

    if (type === ProjectUpdateEnum.REMOVED_FILES_FROM_RELEASE) {
      await this.notificationsService.registerRemovedTracksFromRelease(
        projectId,
        release,
        userId,
        info.tracks,
      );

      updateDoc.info = info;
      updateDoc.release = release;
    }

    if (type === ProjectUpdateEnum.ADDED_FILES_TO_MAIN_FOLDER) {
      updateDoc.info = info;

      await this.notificationsService.registerNewTrackOnMainFolder(
        projectId,
        userId,
        info.tracks,
      );

      await this.feedsService.addAddedTracksToProjectActivity(
        projectId.toString(),
        userId.toString(),
        info.tracks,
      );
    }

    if (type === ProjectUpdateEnum.UNLINKED_FILES_FROM_MAIN_FOLDER) {
      updateDoc.info = info;
    }

    if (type === ProjectUpdateEnum.ADDED_FILES_TO_RELEASE) {
      await this.notificationsService.registerAddedTracksToRelease(
        projectId,
        release,
        userId,
        info.tracks,
      );

      await this.feedsService.addAddedTracksToReleaseActivity(
        projectId.toString(),
        release.toString(),
        userId.toString(),
        info.tracks,
      );

      updateDoc.info = info;
      updateDoc.release = release;
    }

    if (type === ProjectUpdateEnum.RENAMED_PROJECT) {
      updateDoc.info = info;
    }

    if (type === ProjectUpdateEnum.PUBLISHED_RELEASE) {
      updateDoc.release = release;
    }

    if (type === ProjectUpdateEnum.CREATED_RELEASE) {
      updateDoc.release = release;
    }

    if (type === ProjectUpdateEnum.RENAMED_RELEASE) {
      updateDoc.info = info;
      updateDoc.release = release;
    }

    if (type === ProjectUpdateEnum.COMMENT) {
      await this.feedsService.addCommentedOnProjectActivity(
        projectId.toString(),
        userId.toString(),
        info.comment,
      );

      updateDoc.info = info;
    }

    if (type === ProjectUpdateEnum.CREATED_PROJECT) {
      updateDoc.info = info;
    }

    project.updates.push(updateDoc);
    await project.save();

    return project;
  }
}
