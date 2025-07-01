import { Model } from 'mongoose';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { lastValueFrom } from 'rxjs';
import { ObjectId } from 'mongodb';
import filetype from 'magic-bytes.js';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';
import { HttpService } from '@nestjs/axios';

import {
  AddCommentDto,
  CreatePreviewDto,
  CreateProjectsDto,
  CreateProjectUpdateDto,
  UpdateProjectCollaboratorsDto,
  UpdateProjectsDto,
} from './dto';
import { DEFAULT_AUDIO_FILE_REDIS_CACHE_TTL } from './utils/constants';
import ServiceException from './exceptions/ServiceException';
import {
  Project,
  ProjectDocument,
  Release,
  ReleaseDocument,
  TrackProjectDocument,
  User,
  Applications,
  Collaboration,
  Track,
  UserDocument,
} from '../schemas/schemas';
import { FeedsService } from './services/feeds.service';
import { ProjectNotifyService } from './services/projectNotifications.service';
import { ProjectUpdateService } from './services/projectUpdate.service';
import { ExceptionsEnum, StatusReleaseEnum } from './utils/enums';
import { forbiddenError, resourceNotFoundError } from './utils/errors';
import {
  getArtworkImageName,
  getCoverImageName,
  mimetypeToFileExtension,
} from './utils/functions';
import {
  Collaborator,
  ForeignKeyField,
  CreateProjectUpdate,
} from './utils/types';

// TODO: sometimes this is not installed but there is no error message for it.
// Took me forever to figure this out.
// eslint-disable-next-line no-var, @typescript-eslint/no-var-requires
var ffmpeg = require('fluent-ffmpeg');
// eslint-disable-next-line @typescript-eslint/no-var-requires.
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { ProjectGetterService } from './services/projectGetter.service';
import { FileStorageService } from '../file-storage/fileStorage.service';
import { TracksService } from '../tracks/tracks.service';
import { EventTypeEnum } from '../gamificationEvent/utils/enum';
import { UserActivityService } from '../user-activity/user-activity.service';
import { NotifiesService } from '../notifies/notifies.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Release.name) private releaseModel: Model<ReleaseDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Track.name) private trackModel: Model<Track>,
    @InjectModel(Applications.name)
    private applicationsModel: Model<Applications>,
    @InjectModel(Collaboration.name)
    private collaborationModel: Model<Collaboration>,
    @InjectModel('tracks_projects')
    private trackProjectModel: Model<TrackProjectDocument>,
    private projectUpdateService: ProjectUpdateService,
    private projectNotifyService: ProjectNotifyService,
    private feedsService: FeedsService,
    private readonly httpService: HttpService,
    private projectGetterService: ProjectGetterService,
    private fileStorageService: FileStorageService,
    @Inject(forwardRef(() => TracksService))
    private tracksService: TracksService,
    @InjectRedis() private readonly redis: Redis,
    private readonly userActivityService: UserActivityService,
    private readonly notificationService: NotifiesService,

  ) { }

  /**
   * Save new project on database
   * @param createProjectDto Informations to create a project
   * @returns New Project
   */
  async create(createProjectDto: CreateProjectsDto): Promise<Project> {
    const collaborators = createProjectDto.collaborators?.map(
      (collaborator) => {
        const newCollaborator = { ...collaborator };

        if (collaborator.split) {
          newCollaborator.split = parseInt(collaborator.split as string) | 0;
        }

        return {
          ...newCollaborator,
          user: collaborator.user ? new ObjectId(collaborator.user) : null,
          roles: collaborator.roles?.map((role) => new ObjectId(role)),
          invitedForProject:
            typeof collaborator.invitedForProject === 'string'
              ? collaborator.invitedForProject === 'true'
              : collaborator.invitedForProject,
        };
      },
    );

    const newProject: any = {
      ...createProjectDto,
      user: new ObjectId(createProjectDto.user),
      ownerRoles:
        createProjectDto.ownerRoles?.map((role) => new ObjectId(role)) || null,
      isPublic: false,
    };

    if (collaborators?.length) {
      newProject.collaborators = collaborators;
    }

    //Add artwork extension
    newProject.artworkExension =
      createProjectDto.file &&
      mimetypeToFileExtension(createProjectDto.file.mimetype);

    const createdProject = new this.projectModel(newProject);

    await createdProject.save();

    await this.projectUpdateService.createCreatedProject(
      createdProject._id,
      new ObjectId(createProjectDto.user),
    );

    // Fetch track and link with project
    const track = await this.tracksService.getTrackById({
      id: createProjectDto.trackId,
      owner: createProjectDto.user,
    });
    if (track) {
      const filterCollaborators =
        createdProject.collaborators
          ?.filter(
            (collaborator: any) => collaborator.permission !== 'VIEW_ONLY',
          )
          .map((collaborator: any) => collaborator.user?._id) || [];

      const collaboratorIds = [createdProject.user, ...filterCollaborators];
      if (collaboratorIds.includes(createdProject.user)) {
        await this.tracksService.linkToProject({
          owner: createdProject.user.toString(),
          trackIds: [createProjectDto.trackId],
          projectId: createdProject._id,
        });
      }
    }

    if (createProjectDto.file) {
      //Send message to create file on bucket
      let uploadResult: string;

      try {
        uploadResult = await this.fileStorageService.uploadImage(createProjectDto.user, {
          id: createdProject._id.toString() + '_artwork',
          fileCacheKey: createProjectDto.file.fileCacheKey,
          mimetype: createProjectDto.file.mimetype,
          size: createProjectDto.file.size,
          // isPublic means it goes in the public storage bucket - not that it belongs to a public project
          isPublic: false,
        },
          {
            key: createdProject._id.toString() + '_artwork',
            file: 'artwork',
            fileFor: 'project',
            project_id: createdProject._id,
            newFile: true
          });
      } catch (error) {
        uploadResult = error;
      }

      //If an error ocurred, try to remove the document and throw an error
      if (!uploadResult) {
        await this.projectModel.deleteOne({
          user_id: createdProject.user,
          _id: createdProject._id,
        });

        throw new ServiceException(
          'Error uploading file',
          ExceptionsEnum.InternalServerError,
        );
      }
    }

    if (createdProject.collaborators.length) {
      createdProject.collaborators.map(async (collaborator) => {
        const foundCollaborator = await this.userModel.findById(
          new ObjectId(collaborator?.user?.toString()),
        );
        await this.projectNotifyService.registerAddCollaboratorToProject({
          projectId: new ObjectId(createdProject._id?.toString()),
          authorId: new ObjectId(createdProject.user?.toString()),
          collaboratorName: foundCollaborator?.name || '',
        });
      });
    }

    const notInvitedCollaborators =
      createProjectDto.collaborators?.filter(
        (collaborator) => !!collaborator.user,
      ) || [];
    const notInvitedCollaboratorsIds = notInvitedCollaborators.map(
      (collaborator) => collaborator.user,
    );

    const followProjectFeedPromises = [
      createProjectDto.user,
      ...notInvitedCollaboratorsIds,
    ].map((userId) => {
      this.feedsService.followProjectFeed(
        userId,
        createdProject._id.toString(),
      );
    });

    await Promise.all(followProjectFeedPromises);

    // // Kazm track event
    // // What if user do not have any email added yet
    // const userDetails = await this.userModel.findById(createProjectDto.user);
    // if (userDetails.email) {
    //   const eventBody = {
    //     eventType: KAZM_EVENT_TYPE['CREATE_PROJECT'],
    //     connectedAccount: {
    //       id: userDetails.email,
    //       accountType: 'EMAIL',
    //     },
    //   };
    //   await this.kazmService.trackEvent(eventBody);
    // }

    //gamification token assign
    await this.userActivityService.activity(createProjectDto.user, EventTypeEnum.CREATE_PROJECT)

    return await this.projectGetterService.getProjectUnrestricted(
      createdProject._id.toString(),
    );
  }

  /**
   * Update project on database
   *
   * @param updateProjectsDto Informations to update a project
   * @returns Updated Project
   */
  async update({
    projectId,
    updateProjectsDto,
    owner,
  }: {
    projectId: string;
    updateProjectsDto: UpdateProjectsDto;
    owner: string;
  }): Promise<Project> {
    let project = await this.projectModel.findById(projectId);

    if (!project) {
      resourceNotFoundError('Project');
    }

    const oldName = project.name;
    const newName = updateProjectsDto.name;
    const hasUpdatedName = !!newName?.trim() && oldName !== newName;

    const {
      collaborators,
      emptyCollaborators,
      split,
      ownerRoles,
      ...updatedProject
    }: any = updateProjectsDto;

    //Check if should update artworkfile
    if (updateProjectsDto.file?.fileCacheKey) {
      //Send message to create file on bucket
      let uploadResult: string;

      //Add artwork extension
      updateProjectsDto.artworkExension = mimetypeToFileExtension(
        updateProjectsDto.file.mimetype,
      );

      try {
        uploadResult = await this.fileStorageService.uploadImage(owner, {
          id: projectId + '_artwork',
          fileCacheKey: updateProjectsDto.file.fileCacheKey,
          mimetype: updateProjectsDto.file.mimetype,
          size: updateProjectsDto.file.size,
          // isPublic means it goes in the public storage bucket - not that it belongs to a public project
          isPublic: false,
        },
          {
            key: projectId + '_artwork',
            file: 'artwork',
            fileFor: 'project',
            project_id: projectId,
            newFile: false
          });
      } catch (error) {
        uploadResult = error;
      }

      //If an error ocurred, try to remove the document and throw an error
      if (!uploadResult) {
        throw new ServiceException(
          'Error uploading file',
          ExceptionsEnum.InternalServerError,
        );
      }
    }

    //Check if should update cover image file
    if (updateProjectsDto.coverImage?.fileCacheKey) {
      //Send message to create file on bucket
      let uploadResult: string;

      //Add artwork extension
      updateProjectsDto.coverExtension = mimetypeToFileExtension(
        updateProjectsDto.coverImage.mimetype,
      );

      try {
        uploadResult = await this.fileStorageService.uploadImage(owner, {
          id: `${projectId}_cover_image`,
          fileCacheKey: updateProjectsDto.coverImage.fileCacheKey,
          mimetype: updateProjectsDto.coverImage.mimetype,
          size: updateProjectsDto.coverImage.size,
          // isPublic means it goes in the public storage bucket - not that it belongs to a public project
          isPublic: false,
        },
          {
            key: `${projectId}_cover_image`,
            file: 'cover_image',
            fileFor: 'project',
            project_id: projectId,
            newFile: true
          });
      } catch (error) {
        uploadResult = error;
      }

      //If an error ocurred, try to remove the document and throw an error
      if (!uploadResult) {
        throw new ServiceException(
          'Error uploading cover image file',
          ExceptionsEnum.InternalServerError,
        );
      }
    }

    await this.projectModel.findByIdAndUpdate(projectId, updateProjectsDto);

    let updateCollaborators: UpdateProjectCollaboratorsDto = {
      id: projectId,
    };

    if (ownerRoles?.length) {
      if (ownerRoles[0] === 'empty') {
        updateCollaborators.ownerRoles = null;
      } else {
        updateCollaborators.ownerRoles = ownerRoles;
      }
    }

    split && (updateCollaborators.split = split);

    if (collaborators?.length) {
      updateCollaborators = {
        ...updateCollaborators,
        collaborators,
      };
    }

    if (emptyCollaborators) {
      updateCollaborators = {
        ...updateCollaborators,
        collaborators: [],
      };
    }

    if (
      ['ownerRoles', 'split', 'collaborators'].some((key) =>
        updateCollaborators.hasOwnProperty(key),
      )
    ) {
      await this.updateCollaborators(updateCollaborators);
    }

    project = await this.projectModel.findById(projectId);

    if (hasUpdatedName) {
      await this.projectUpdateService.createRenamedProject(
        project._id,
        oldName,
        newName,
        new ObjectId(owner),
      );
    }

    return await this.projectGetterService.getProjectUnrestricted(projectId);
  }

  /**
   * Update project collaborators
   *
   * @param {UpdateProjectCollaboratorsDto} updateProjectCollaboratorsDto Informations to update project collaborators
   * @returns Updated Project
   */
  async updateCollaborators({
    id,
    collaborators,
    ...updateProjectCollaboratorsDto
  }: UpdateProjectCollaboratorsDto): Promise<any> {
    const project = await this.projectModel.findById(
      new ObjectId(id?.toString()),
    );

    // TODO: use reduce instead
    const oldCollaboratorIds = project.collaborators
      ?.filter((collab) => collab.user)
      .map((collab) => collab.user.toString());

    let collaboratorsFormatted = [];

    if (collaborators?.length) {
      collaboratorsFormatted = collaborators?.map((collaborator) => {
        const newCollaborator = { ...collaborator };

        if (collaborator?.split) {
          newCollaborator.split = parseInt(collaborator.split as string) | 0;
        }

        return {
          ...newCollaborator,
          user: collaborator.user ? new ObjectId(collaborator.user) : null,
          roles: collaborator.roles?.map((role) => new ObjectId(role)),
          accepted: false,
          invitedForProject:
            typeof collaborator.invitedForProject === 'string'
              ? collaborator.invitedForProject === 'true'
              : collaborator.invitedForProject,
        };
      });
    }

    let fieldsToUpdate: any = {
      collaborators: collaboratorsFormatted,
    };

    if (updateProjectCollaboratorsDto.hasOwnProperty('ownerRoles')) {
      fieldsToUpdate = {
        ...fieldsToUpdate,
        ownerRoles: updateProjectCollaboratorsDto.ownerRoles?.map(
          (role) => new ObjectId(role) || null,
        ),
      };
    }

    if (updateProjectCollaboratorsDto.hasOwnProperty('split')) {
      fieldsToUpdate = {
        ...fieldsToUpdate,
        split: updateProjectCollaboratorsDto.split,
      };
    }

    await this.projectModel.findByIdAndUpdate(id, fieldsToUpdate);

    const toDeleteApplicationCollaborators: any = collaborators?.filter(
      (collab: any) => !collab.invitedForProject && collab.user,
    );

    if (toDeleteApplicationCollaborators?.length) {
      await this.deleteApplicationsFromUserOnProject(
        id,
        toDeleteApplicationCollaborators,
      );
    }

    const updatedCollaboratorIds =
      collaborators
        ?.filter((collab) => collab.user)
        .map((collab) => collab.user.toString()) || [];

    const removedCollaboratorIds = oldCollaboratorIds.filter(
      (id) => !updatedCollaboratorIds.includes(id),
    );

    const newCollaboratorIds = updatedCollaboratorIds?.filter(
      (collabId) => !oldCollaboratorIds.includes(collabId),
    );

    //mail sending to new collaborators
    const users = await this.userModel.find({ _id: { $in: newCollaboratorIds }, });
    await Promise.all(users.map(user =>
      this.notificationService.sendInvitesCollaborator({
        email: user.email,
        name: user.name,
        projectId: id.toString(),
        projectName: project.name
      })
    ));

    // notify about removed collaborators
    if (removedCollaboratorIds?.length) {
      removedCollaboratorIds.map(async (removedCollaboratorId) => {
        const foundCollaborator = await this.userModel.findById(
          new ObjectId(removedCollaboratorId.toString()),
        );
        await this.projectNotifyService.registerRemoveCollaboratorFromProject({
          projectId: new ObjectId(project._id?.toString()),
          authorId: new ObjectId(project.user?.toString()),
          collaboratorName: foundCollaborator?.name || '',
        });
      });

      const followProjectFeedPromises = newCollaboratorIds.map(
        (collaboratorId) => {
          this.feedsService.followProjectFeed(collaboratorId, id);
        },
      );

      await Promise.all(followProjectFeedPromises);
    }

    // notify about new collaborators
    if (newCollaboratorIds?.length) {
      newCollaboratorIds.map(async (newCollaboratorId) => {
        const foundCollaborator = await this.userModel.findById(
          new ObjectId(newCollaboratorId.toString()),
        );
        await this.projectNotifyService.registerAddCollaboratorToProject({
          projectId: new ObjectId(project._id?.toString()),
          authorId: new ObjectId(project.user?.toString()),
          collaboratorName: foundCollaborator?.name || '',
        });
      });

      const followProjectFeedPromises = newCollaboratorIds.map(
        (collaboratorId) => {
          this.feedsService.followProjectFeed(collaboratorId, id);
        },
      );

      await Promise.all(followProjectFeedPromises);
    }

    const unfollowProjectFeedPromises = removedCollaboratorIds.map(
      (collaboratorId) => {
        this.feedsService.unfollowProjectFeed(collaboratorId, id);
      },
    );

    await Promise.all(unfollowProjectFeedPromises);

    return "Updated Successfully."
  }

  /**
   * Delete project on database
   * @param {string} projectId Project id who will deleted
   */
  async delete(projectId: string): Promise<Project> {
    //Get the extension for the file
    const projectFound = await this.projectModel.findById(projectId).select({
      user: 1,
      artworkExension: 1,
      coverExtension: 1,
    });

    if (!projectFound) {
      throw resourceNotFoundError('Project');
    }

    if (projectFound?.artworkExension) {
      const deleteResult = await this.deleteImage(
        projectFound.user,
        projectFound._id.toString() + '_artwork'
        // getArtworkImageName({
        //   id: projectFound._id.toString(),
        //   extension: projectFound.artworkExension,
        // }),
      );

      //Check if the file was delete
      if (deleteResult !== 'File deleted') {
        throw new ServiceException(
          'Error deleting project',
          ExceptionsEnum.InternalServerError,
        );
      }
    }

    if (projectFound?.coverExtension) {
      const deleteResult = await this.deleteImage(
        projectFound.user,
        projectFound._id.toString() + '_cover_image'
        // getCoverImageName({
        //   id: projectFound._id.toString(),
        //   extension: projectFound.artworkExension,
        // }),
      );

      //Check if the file was delete
      if (deleteResult !== 'File deleted') {
        throw new ServiceException(
          'Error deleting project',
          ExceptionsEnum.InternalServerError,
        );
      }
    }

    await this.releaseModel.deleteMany({ project: new ObjectId(projectId) });
    await this.trackProjectModel.deleteMany({ projectId });
    await this.applicationsModel.deleteMany({
      projectId,
    });

    await this.collaborationModel.deleteMany({
      projectId,
    });

    await this.projectNotifyService.deleteProjectNotifications({
      projectId,
    });

    return await this.projectModel.findByIdAndDelete(projectId);
  }

  /**
   * Remove images from server by file id name
   * @param {string} name Image name in server
   */
  async deleteImage(userId: string | any, name: string): Promise<any> {
    try {
      const result = await this.fileStorageService.deleteImage(userId, {
        name,
      });
      return result;
    } catch (error) {
      return error;
    }
  }

  async linkInvitedProjectsCollaboratorsToUser({
    email,
    userId,
  }: {
    email: string;
    userId: ForeignKeyField<User>;
  }): Promise<void> {
    const projectsWithInvitedCollaborator = await this.projectModel.find({
      'collaborators.email': email,
      'collaborators.invitedForProject': true,
    });
    const user = await this.userModel.findById(new ObjectId(userId as string));

    if (!user || user.email !== email) {
      resourceNotFoundError('User');
    }

    for (const project of projectsWithInvitedCollaborator) {
      const { collaborators } = project;

      const newCollaborators = collaborators.map((collaborator) => {
        if (collaborator.email === email) {
          collaborator.invitedForProject = false;
          collaborator.user = user._id;
          delete collaborator.email;
        }

        return collaborator;
      });

      await this.projectModel.findByIdAndUpdate(project._id, {
        collaborators: newCollaborators,
      });

      const release = await this.releaseModel.findOne({
        project: project._id,
        status: StatusReleaseEnum.IN_PROGRESS,
      });

      if (release) {
        release?.contracts.push({
          user: user._id,
          split: 0,
          accepted: false,
          address: '',
        });
        release.save();
      }

    }

    return;
  }

  async deleteAllProjectsByUser(userId: string) {
    //   all users project
    const projects = await this.projectGetterService.getAllFromUser({
      userId: userId,
      onlyOwner: true,
    });

    // Remove all user projects
    const promises = projects.map(
      async (project: any) => await this.delete(project._id.toString()),
    );

    await Promise.all(promises);
  }

  async deleteUserFromCollaborations(userId: string) {
    const projects: Project[] = await this.projectModel.find({
      'collaborators.user': new ObjectId(userId),
    });

    const promises = projects.map(async (project: any) => {
      const collaborators = project.collaborators.filter(
        (collab: any) => collab?.user?.toString() !== userId,
      );
      return await this.projectModel.updateOne(
        { _id: project._id },
        { $set: { collaborators } },
      );
    });

    await Promise.all(promises);

    return;
  }

  /**
   * Create a new application to some project
   *
   * @param {string | ObjectId} userId
   * @param {string | ObjectId} projectId
   * @param {string} brief
   * @returns {Promise<Applications>}
   */
  public async createApplication({
    userId,
    projectId,
    brief,
    track,
  }: {
    userId: string | ObjectId;
    projectId: string | ObjectId;
    brief: string;
    track: string;
  }): Promise<Applications> {
    const userOwnTrack = await this.trackModel.findOne({
      _id: track,
      user_id: userId,
    });

    if (userOwnTrack == null) {
      forbiddenError('Tracks');
    }

    const entry = new this.applicationsModel({
      user: userId,
      projectId,
      brief,
      track,
    });

    await entry.save();
    return entry;
  }

  /**
   * Get applications from a project
   *
   * @param {string | ObjectId} projectId
   * @throws {ServiceException} if user doesn't own lyrics
   * @returns {Promise<any[]>}
   */
  async getApplications(projectId: string | ObjectId) {
    return await this.applicationsModel
      .find({ projectId })
      .populate({
        path: 'user',
        model: 'User',
        select: { name: 1, profile_img: 1, email: 1 },
      })
      .populate({
        path: 'track',
        model: 'Track',
      });
  }

  /**
   * Delete a aplication from a project
   *
   * @param {string[] | ObjectId[]} applicationIds
   * @param {string | ObjectId} projectId

   * @throws {ServiceException} if user doesn't own lyrics
   * @returns {Promise<any[]>}
   */
  async deleteApplications({
    projectId,
    applicationIds,
  }: {
    projectId: string | ObjectId;
    applicationIds: string[] | ObjectId[];
  }): Promise<void> {
    await this.applicationsModel
      .deleteMany()
      .where('projectId')
      .equals(projectId)
      .where('_id')
      .in(applicationIds)
      .exec();
    return;
  }

  /**
   * Deletes applications from a project.
   *
   * @param {string | ObjectId} projectId
   * @param {Collaborator[]} collaborators
   * @returns {Promise<void>}
   */
  private async deleteApplicationsFromUserOnProject(
    projectId: string | ObjectId,
    collaborators: Collaborator[],
  ) {
    await this.applicationsModel.deleteMany({
      projectId,
      user: {
        $in: collaborators.map(({ user }) => new ObjectId(user.toString())),
      },
    });
  }

  async createPreview({
    owner,
    createPreviewDto,
  }: {
    owner: string;
    createPreviewDto: CreatePreviewDto;
  }) {
    const { trackId, startInSec, endInSec } = createPreviewDto;

    let track = null;
    try {
      const res = await this.tracksService.getTrackById({
        owner,
        id: trackId,
      });
      track = res || null;
    } catch (error) {
      throw new ServiceException(
        'error retrieveing track.',
        ExceptionsEnum.InternalServerError,
      );
    }

    if (!track) {
      throw new ServiceException(
        'error retrieveing track.',
        ExceptionsEnum.InternalServerError,
      );
    }

    const { url } = track;

    const { data: arrayBuffer } = await lastValueFrom(
      this.httpService.get(url, {
        responseType: 'arraybuffer',
      }),
    );

    const buffer = Buffer.from(arrayBuffer);

    const originalBufferFiletypeInfo = await filetype(
      new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.length),
    )[0];

    // Define the temporary file path
    const tmpFilePath = join(
      __dirname,
      `${trackId}.${originalBufferFiletypeInfo?.extension}`,
    );

    // Write the temporary file to disk
    writeFileSync(tmpFilePath, arrayBuffer);

    const PREVIEW_EXTENSION = 'mp3';

    const command = ffmpeg(tmpFilePath)
      .setStartTime(parseFloat(startInSec))
      .setDuration(parseFloat(endInSec) - parseFloat(startInSec))
      .toFormat(PREVIEW_EXTENSION);

    const clippedBuffer: Buffer = await new Promise((resolve, reject) => {
      const ffstream = command.pipe();

      const chunks = [];
      ffstream
        .on('data', (chunk) => {
          chunks.push(chunk);
        })
        .on('end', () => {
          const resultBuffer = Buffer.concat(chunks);
          unlinkSync(tmpFilePath);
          resolve(resultBuffer);
        })
        .on('error', (err) => {
          console.error('Error:', err);
          reject();
        });
    });

    //Validate the type
    const clppedBufferFileTypeInfo = await filetype(
      new Uint8Array(
        clippedBuffer.buffer,
        clippedBuffer.byteOffset,
        clippedBuffer.length,
      ),
    )[0];

    if (!clppedBufferFileTypeInfo) {
      throw new ServiceException(
        'Error getting file type info',
        ExceptionsEnum.InternalServerError,
      );
    }

    const bufferSize = clippedBuffer.byteLength;
    const mimetypeInfo = clppedBufferFileTypeInfo.mime;
    const [fileType] = mimetypeInfo.split('/');

    //Add the file info to the redis
    const fileCacheKey = `${track.name
      .trim()
      .replace(/\s/g, '')}_${fileType}_preview_${Date.now()}`;

    //Save to the redis
    try {
      await this.redis.setBuffer(
        fileCacheKey,
        clippedBuffer,
        'EX',
        DEFAULT_AUDIO_FILE_REDIS_CACHE_TTL,
      );
    } catch (error) {
      throw new ServiceException(
        'Error saving file on cache',
        ExceptionsEnum.InternalServerError,
      );
    }

    // upload clipped audio to storage
    const myMediaFile = {
      buffer: clippedBuffer,
      fileCacheKey: fileCacheKey,
      mimetype: mimetypeInfo,
      size: bufferSize,
    };

    const previewStorageName = `PREVIEW._${trackId}`;

    try {
      await this.fileStorageService.uploadAudio(owner,
        {
          id: previewStorageName,
          fileCacheKey: myMediaFile.fileCacheKey,
          mimetype: myMediaFile.mimetype,
          size: myMediaFile.size,
          // isPublic means it goes in the public storage bucket - not that it belongs to a public project
          isPublic: false,
        },
        {
          file: 'preview',
          fileFor: 'track',
          track_id: trackId
        }
      );
    } catch {
      await this.redis.del(fileCacheKey);
      throw new ServiceException(
        'Error uploading clipped audio to storage',
        ExceptionsEnum.InternalServerError,
      );
    }

    //delete from redis
    try {
      await this.redis.del(fileCacheKey);
    } catch (error) {
      throw new ServiceException(
        'Error deleting redis cache key',
        ExceptionsEnum.InternalServerError,
      );
    }

    // fetch url for clipped audio
    let uploadedFileUrl = '';
    try {
      const res = await this.fileStorageService.getAudioUrl({
        name: previewStorageName,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, url] = res || [];
      uploadedFileUrl = url;
    } catch {
      throw new ServiceException(
        'Error fetching new clipped audio file url',
        ExceptionsEnum.InternalServerError,
      );
    }

    // update original track
    try {
      await this.tracksService.updateTrack({
        track_id: trackId,
        userId: owner,
        trackDto: {
          previewStart: parseFloat(startInSec),
          previewEnd: parseFloat(endInSec),
          previewExtension: PREVIEW_EXTENSION,
        },
      });
    } catch {
      throw new ServiceException(
        'Error updating track',
        ExceptionsEnum.InternalServerError,
      );
    }

    return uploadedFileUrl;
  }

  async addUpdate({
    projectId,
    release,
    userId,
    type,
    info,
  }: CreateProjectUpdateDto) {
    const projectUpdateData: CreateProjectUpdate = {
      type,
      project: new ObjectId(projectId),
      release: release ? new ObjectId(release) : null,
      info,
      userId: new ObjectId(userId),
    };

    return await this.projectUpdateService.create(projectUpdateData);
  }

  async addComment({ id, comment, owner }: AddCommentDto) {
    return await this.projectUpdateService.createComment(
      new ObjectId(id),
      comment,
      new ObjectId(owner),
    );
  }
}
