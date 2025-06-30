import { ObjectId } from 'mongodb';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Inject, Injectable } from '@nestjs/common';
import { Document, Model, Types as MongooseTypes } from 'mongoose';
import { ProjectGetterService } from '../projects/services/projectGetter.service';
import {
  SongContestDto,
  UpdateSongContestDto,
  SavedSongContestDto,
  SongContestResponseDto,
  RequestApplicationDto,
  updateApplication,
} from './dto';
import { resourceNotFoundError } from '../users/utils/errors';
import { CollaborateWithEnum } from '../schemas/utils/enums';
import {
  SongContest,
  SongContestDocument,
} from '../schemas/schemas/song-contest.schema';
import { Project, Track, TrackDocument, TrackProject, User, UserDocument } from '../schemas/schemas';
import {
  SavedSongContest,
  SavedSongContestDocument,
} from '../schemas/schemas/savedSongContest.schema';
import { selectedTabFilter as TabFilters, SortBy } from './types/types';
import {
  songContestApplications,
  songContestApplicationsDocument,
} from '../schemas/schemas/songContestApplications.schema';
import { FileStorageService } from '../file-storage/fileStorage.service';
import ServiceException from '../tracks/exceptions/ServiceException';
import { ExceptionsEnum } from '../tracks/utils/types';
import { NotifiesService } from '../notifies/notifies.service';
import { UserActivityService } from '../user-activity/user-activity.service';
import { EventTypeEnum } from '../gamificationEvent/utils/enum';

@Injectable()
export class SongContestService {
  private configService: ConfigService<Record<string, unknown>, false>;
  constructor(
    //models
    @InjectModel(SongContest.name)
    private songContestModel: Model<SongContestDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(SavedSongContest.name)
    private savedSongContestModal: Model<SavedSongContestDocument>,
    @InjectModel(Track.name) private trackModel: Model<TrackDocument>,
    @InjectModel(songContestApplications.name)
    private applicationModel: Model<songContestApplications>,

    @InjectModel('tracks_projects')
    private trackProjectModel: Model<TrackProject>,

    @InjectModel(Project.name)
    private projectModel: Model<Project>,

    //services
    @Inject(ProjectGetterService)
    private readonly projectGetterService: ProjectGetterService,
    @Inject(FileStorageService)
    private readonly fileStorageService: FileStorageService,
    private readonly notificationService: NotifiesService,
    private readonly userActivityService: UserActivityService,

  ) {
    this.configService = new ConfigService();
  }

  /**
   * Get project entity details
   *
   * @param {String} project_id
   * @returns {Promise<Project>}
   */
  private getProject(project_id: string, owner): any {
    return this.projectGetterService.getProject({
      projectId: project_id,
      owner,
    });
  }

  /**
   * Create a new song contest for a user
   * @param id User id who owns song contest
   * @param SongContestDto Object that contains the information to create them
   * @returns The new Song Contest object
   */
  async createSongContest({ id, data }: { id: string; data: SongContestDto }) {
    const user = await this.userModel.findById(new ObjectId(id));
    if (!user) {
      resourceNotFoundError('User');
    }

    let newSongContest: Document<any, any, SongContestDocument> &
      SongContest &
      Document & { _id: MongooseTypes.ObjectId } = undefined;

    const project = await this.getProject(data.projectId, user._id);
    if (!project) {
      resourceNotFoundError('Project');
    }
    const trackLength = data.tracks.length;
    if (trackLength > 5) {
      throw new Error('please select minimum 1 and maximum 5 tracks');
    }

    if (data.collaborateWith === CollaborateWithEnum.FANS) {
      newSongContest = await new this.songContestModel({
        userId: user._id,
        projectId: data.projectId,
        ...data,
      });
    } else {
      newSongContest = await new this.songContestModel({
        userId: user._id,
        projectId: data.projectId,
        ...data,
      });
    }

    await newSongContest.save();

    const baseUrl = 'www.musicalapp.com/';
    let redirectUrl: string;
    if (newSongContest.collaborateWith === CollaborateWithEnum.FANS) {
      redirectUrl =
        baseUrl + `explore-fans/collaborationId${newSongContest._id}`;
    } else {
      redirectUrl =
        baseUrl +
        `explore-collaborations?collaborationId=${newSongContest._id}`;
    }

    //gamification token assign
    await this.userActivityService.activity(user._id, EventTypeEnum.POST_COLLABORATION)

    return redirectUrl;
  }

  /**
   * get all song contest
   * @returns all song contest
   */
  async getAllSongContest({
    userId,
    offSet,
    filters,
    sortBy,
    txtFilter,
    selectedTabFilter,
    collaborateWith
  }: {
    offSet?: number;
    filters?: {
      styles?: string[];
      seeking?: string[];
      languages?: string[];
    };
    sortBy?: string;
    txtFilter?: string;
    projectId?: string | null;
    selectedTabFilter?: string;
    userId?: string | null;
    collaborateWith?: string | null;
  }) {
    const queryFilters = Object.entries(filters).reduce(
      (pred, [filterType, value]) => ({
        ...pred,
        ...(value
          ? {
            [filterType]: {
              $in: value.map((x) => new ObjectId(x)),
            },
          }
          : {}),
      }),
      txtFilter && txtFilter.length > 0
        ? {
          $or: [
            { title: { $regex: new RegExp('^' + txtFilter), $options: 'i' } },
            { brief: { $regex: new RegExp('^' + txtFilter), $options: 'i' } },
          ],
        }
        : {},
    );

    const sortOptions = {
      [SortBy.RECENT]: { createdAt: -1 },
      [SortBy.ASCENDING]: { title: 1 },
      [SortBy.DESCENDING]: { title: -1 },
    };

    const defaultSort = { createdAt: -1 };
    const sortByDeadine =
      sortBy === SortBy.DEADLINE_ASCENDING ||
      sortBy === SortBy.DEADLINE_DESCENDING;
    const sortExpression =
      sortBy && sortOptions[sortBy] ? sortOptions[sortBy] : defaultSort;

    console.log('sort by deadline...', sortByDeadine);
    const savedSongcontest = await this.savedSongContestModal.find({
      userId: userId,
    });
    const savedSongContestIds = savedSongcontest.map((x) => x.songContestId);
    let res;
    if (selectedTabFilter === TabFilters.SAVED) {
      res = await this.songContestModel.aggregate([
        {
          $sort: { createdAt: -1 },
        },
        {
          $match: {
            ...queryFilters,
            _id: { $in: savedSongContestIds.map((x) => new ObjectId(x)) },
            collaborateWith: collaborateWith ? collaborateWith : { $in: [CollaborateWithEnum.FANS, CollaborateWithEnum.ARTIST] }
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
            pipeline: [
              { $project: { name: 1, email: 1, _id: 1, profile_img: 1 } },
            ],
          },
        },
        {
          $unwind: '$user',
        },
        {
          $lookup: {
            from: 'skill_types',
            localField: 'seeking',
            foreignField: '_id',
            as: 'seeking',
            pipeline: [
              { $project: { type: 1, title: 1 } }
            ]
          },
        },
        {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [{ $skip: offSet * 10 }, { $limit: 10 }],
          },
        },
      ]);
    }
    if (selectedTabFilter === TabFilters.RECENT) {
      res = await this.songContestModel.aggregate([
        {
          $match: {
            ...queryFilters,
            collaborateWith: collaborateWith ? collaborateWith : { $in: [CollaborateWithEnum.FANS, CollaborateWithEnum.ARTIST] }
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
            pipeline: [
              { $project: { name: 1, email: 1, _id: 1, profile_img: 1 } },
            ],
          },
        },
        {
          $unwind: '$user',
        },
        {
          $lookup: {
            from: 'skill_types',
            localField: 'seeking',
            foreignField: '_id',
            as: 'seeking',
            pipeline: [
              { $project: { type: 1, title: 1 } }
            ]
          },
        },
        ...(sortByDeadine
          ? [
            {
              $addFields: {
                deadlineDifference: {
                  $subtract: ['$duration.endTo', '$duration.startFrom'],
                },
              },
            },
            {
              $sort: {
                deadlineDifference:
                  sortBy === SortBy.DEADLINE_ASCENDING ? 1 : -1,
              },
            },
          ]
          : [
            {
              $sort: sortExpression,
            },
          ]),
        {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [{ $skip: offSet * 10 }, { $limit: 10 }],
          },
        },
      ]);
    }
    if (selectedTabFilter === TabFilters.MOST_POPULAR) {
      const popularSongContests = await this.savedSongContestModal.aggregate([
        {
          $group: {
            _id: '$songContestId',
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ]);
      res = await this.songContestModel.aggregate([
        {
          $match: {
            ...queryFilters,
            collaborateWith: collaborateWith ? collaborateWith : { $in: [CollaborateWithEnum.FANS, CollaborateWithEnum.ARTIST] },
            _id: { $in: popularSongContests.map((x) => new ObjectId(x._id)) },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
            pipeline: [
              { $project: { name: 1, email: 1, _id: 1, profile_img: 1 } },
            ],
          },
        },
        {
          $unwind: '$user',
        },
        {
          $lookup: {
            from: 'skill_types',
            localField: 'seeking',
            foreignField: '_id',
            as: 'seeking',
            pipeline: [
              { $project: { type: 1, title: 1 } }
            ]
          },
        },
        {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [{ $skip: offSet * 10 }, { $limit: 10 }],
          },
        },
      ]);
      const total = (await res?.length) ? res[0]?.metadata[0]?.total : 0;
      const data = await popularSongContests
        .map((item) =>
          res[0]?.data.find((x) => x._id.toString(0) === item._id.toString()),
        )
        .filter(Boolean);
      return {
        total,
        offSet,
        result: data,
      };
    }
    const total = res?.length ? res[0]?.metadata[0]?.total : 0;
    return {
      total,
      offSet,
      result: res[0]?.data,
    };
  }

  /**
   * get song contest details
   * @param {ObjectId|string} id song contest id
   * @returns {Promise<SongContest>} details of song contest
   */

  async getSongContestDetails(id: string): Promise<SongContestResponseDto[]> {
    const songContest = await this.songContestModel.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: 'styles',
          localField: 'styles',
          foreignField: '_id',
          as: 'styles',
          pipeline: [{ $project: { type: 1, title: { en: 1 } } }],
        },
      },
      {
        $lookup: {
          from: 'languages',
          localField: 'languages',
          foreignField: '_id',
          as: 'languages',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId',
          pipeline: [
            { $project: { name: 1, email: 1, _id: 1, profile_img: 1 } },
          ],
        },
      },
      {
        $lookup: {
          from: 'tracks',
          localField: 'tracks',
          foreignField: '_id',
          as: 'tracks',
          pipeline: [
            {
              $lookup: {
                from: 'tags',
                localField: 'tags',
                foreignField: '_id',
                as: 'tags',
              },
            },
            {
              $lookup: {
                from: 'skill_types',
                localField: 'instrument',
                foreignField: '_id',
                as: 'instrument',
              },
            },
            {
              $lookup: {
                from: 'styles',
                localField: 'genre',
                foreignField: '_id',
                as: 'genre',
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                extension: 1,
                size: 1,
                rate: 1,
                duration: 1,
                channels: 1,
                bitrate: 1,
                resolution: 1,
                artwork: 1,
                tags: { $ifNull: ['$tags', []] },
                instrument: { $ifNull: ['$instrument', []] },
                genre: { $ifNull: ['$genre', []] },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'designs',
          localField: 'designs',
          foreignField: '_id',
          as: 'designs',
        },
      },
      {
        $lookup: {
          from: 'projects',
          localField: 'projectId',
          foreignField: '_id',
          as: 'project',
        },
      },
      {
        $lookup: {
          from: 'skill_types',
          localField: 'seeking',
          foreignField: '_id',
          as: 'seeking',
          pipeline: [
            { $project: { type: 1, title: 1 } }
          ]
        },
      },
      {
        $project: {
          title: 1,
          brief: 1,
          styles: 1,
          languages: 1,
          userId: 1,
          tracks: 1,
          seeking: 1,
          designs: 1,
          collaborateWith: 1,
          collaborationType: 1,
          project: '$projectId',
          createdAt: 1,
          duration: 1,
          updatedAt: 1,
        },
      },
      {
        $unwind: '$userId',
      },
    ]);

    if (!songContest) {
      resourceNotFoundError('Song Contest');
    }

    // Add track URLs
    if (songContest[0]?.tracks?.length > 0) {
      const trackNames = songContest[0].tracks.map(
        track => `${track._id}.${track.extension}`
      );

      try {
        const trackUrls = await this.fileStorageService.getAudioUrl({
          name: trackNames,
        });

        songContest[0].tracks = songContest[0].tracks.map((track, i) => ({
          ...track,
          url: trackUrls[i],
        }));
      } catch (error) {
        throw new ServiceException(
          'Error getting track URLs',
          ExceptionsEnum.InternalServerError,
        );
      }
    }

    return songContest;
  }

  /**
   * Update Song Contest Details
   * @param id  Song Contest id that will update
   * @param updateSongConstestDto Informations that will updated
   * @returns Updated Song Contest
   */
  async updateSongContest({
    id,
    updateSongContestDto,
  }: {
    id: string;
    updateSongContestDto: UpdateSongContestDto;
  }) {
    const songContest = await this.songContestModel.findById(new ObjectId(id));
    if (!songContest) {
      resourceNotFoundError('Song Contest');
    }

    await this.songContestModel.updateOne(
      { _id: new ObjectId(id) },
      { ...updateSongContestDto },
    );

    return await this.songContestModel.findById(new ObjectId(id));
  }

  /**
   * Delete Song Contest from base
   * @param id Song Contest id that will be deleted
   * @returns Deleted Song Contest
   */
  async deleteSongContest(id: string) {
    const songContest = await this.songContestModel.findById(new ObjectId(id));
    if (!songContest) {
      resourceNotFoundError('Song Contest');
    }

    await this.songContestModel.deleteOne({ _id: new ObjectId(id) });
    return songContest;
  }

  /**
   * Save Song Contest
   * @param id Song Contest id that will be saved
   * @param userId User id that will save the song contest
   * @returns Saved Song Contest
   */
  async savedSongContest(id: string, data: SavedSongContestDto) {
    let saveSongContest: Document<any, any, SavedSongContestDocument> &
      SavedSongContest &
      Document & { _id: MongooseTypes.ObjectId } = undefined;

    const songContest = await this.songContestModel.findById(
      new ObjectId(data.songContestId),
    );
    const user = await this.userModel.findById(new ObjectId(id));
    if (!user) {
      resourceNotFoundError('User');
    }
    if (!songContest) {
      resourceNotFoundError('Song Contest');
    }

    saveSongContest = await new this.savedSongContestModal({
      songContestId: data.songContestId,
      userId: id,
    });
    await saveSongContest.save();
    return saveSongContest;
  }

  /**
   * remove song contest from saved song contests
   * @param id song contest id that will be removed
   * @param owner user id
   * @returns deleted song removed
   */
  async removeSavedSongContest(id: string, owner: string) {
    const savedSongContest = await this.savedSongContestModal.find({
      songContestId: new ObjectId(id),
    });
    if (!savedSongContest) {
      resourceNotFoundError('Saved Song Contest');
    }
    await this.savedSongContestModal.deleteOne({
      songContestId: new ObjectId(id),
      userId: new ObjectId(owner),
    });
    return savedSongContest;
  }

  /**
   * Get Ids of saved song contest
   * @param userId User id that will be get the saved song contest
   * @returns Ids of saved song contest
   */
  async getIdOfSavedSongContest(userId: string) {
    const savedSongcontest = await this.savedSongContestModal.find({
      userId: userId,
    });
    const savedSongContestIds = savedSongcontest.map((x) => x.songContestId);
    return savedSongContestIds;
  }

  /**
   * apply for song contest
   * @param RequestApplicationDto Application details
   * @param userId User id that will apply for song contest
   * @returns Applied Application
   */
  async applyForSongContest(data: RequestApplicationDto, userId: string) {
    let application: Document<any, any, songContestApplicationsDocument> &
      songContestApplications &
      Document & { _id: MongooseTypes.ObjectId } = undefined;
    const tracks = await this.trackModel.find({
      _id: { $in: data.files?.map((x) => new ObjectId(x)) },
      user_id: new ObjectId(userId),
    });

    if (tracks.length !== data.files.length) {
      resourceNotFoundError('Track');
    }
    application = new this.applicationModel({
      applicantId: userId,
      brief: data.brief,
      links: data.links,
      songContestId: data.songContestId,
      tracks: tracks.map((x) => x._id),
      isArchived: false,
      isFavorite: false,
    });

    await application.save();
    const songContest = await this.songContestModel.findById(data?.songContestId)
    const project = await this.projectModel.findById(songContest?.projectId)

    //notification added
    const projectId = project?._id.toString()
    const userData = await this.songContestModel.findOne({ _id: application.songContestId.toString() })
    const toUserId = userData?.userId?.toString();
    const fromUserId = userId;
    await this.notificationService.collabReq(
      projectId,
      toUserId,
      fromUserId,
    )

    return application;
  }

  /**
   * @param id if of the owner of the song contest
   * @param songContestId id of the song contest
   * @returns all applications for a song contest
   */
  async getApplications(id: string, songContestId: string) {
    const owner = await this.userModel.findById(new ObjectId(id));
    if (!owner) {
      resourceNotFoundError('User');
    }
    const songContest = await this.songContestModel.findById(
      new ObjectId(songContestId),
    );
    if (!songContest) {
      resourceNotFoundError('Song Contest');
    }
    const applications = await this.applicationModel.aggregate([
      {
        $match: {
          songContestId: songContest._id,
        },
      },
      {
        $lookup: {
          from: 'tracks',
          localField: 'track',
          foreignField: '_id',
          as: 'track',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'applicantId',
          foreignField: '_id',
          as: 'user',
          pipeline: [
            { $project: { name: 1, email: 1, _id: 1, profile_img: 1 } },
          ],
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          _id: 1,
          songContestId: 1,
          track: 1,
          user: 1,
          brief: 1,
        },
      },
    ]);
    return applications;
  }

  /**
   * @param id if of the current user
   * @returns all projects that are used in song contests
   */
  async getProjectsFromSongContests(id: string) {
    const songContests = await this.songContestModel.find({
      userId: new ObjectId(id),
    });
    const projectIds: string[] = songContests.map((x) => x.projectId);
    return projectIds;
  }

  /**
   * @param id id of the current user
   * @param projectId id of the project
   * @param tabFilter tab filter
   * @returns all applications for the project and collaborations
   */
  async getApplicationsByProjectId(
    id: string,
    projectId: string,
    tabFilter: string,
  ) {
    const project = await this.getProject(projectId, id);
    const appliedFilter =
      tabFilter === 'favorite'
        ? { isFavorite: true }
        : tabFilter === 'archived'
          ? { isArchived: true }
          : {};

    if (!project) {
      resourceNotFoundError('Project');
    }
    const collaboration = await this.songContestModel.findOne({
      projectId: new ObjectId(projectId),
    });

    if (!collaboration) {
      return [];
    }

    const applications = await this.applicationModel.aggregate([
      {
        $match: {
          songContestId: new ObjectId(collaboration._id),
          isApproved: false,
          ...appliedFilter,
        },
      },
      {
        $lookup: {
          from: 'tracks',
          localField: 'tracks',
          foreignField: '_id',
          as: 'tracks',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'applicantId',
          foreignField: '_id',
          as: 'user',
          pipeline: [
            { $project: { name: 1, email: 1, _id: 1, profile_img: 1 } },
          ],
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          _id: 1,
          projectId: 1,
          tracks: 1,
          user: 1,
          brief: 1,
          createdAt: 1,
          links: 1,
          isFavorite: 1,
          isArchived: 1,
          isApproved: 1,
        },
      },
    ]);

    // Add track URLs
    if (applications.length > 0) {
      const trackNames = applications.flatMap(app =>
        app.tracks.map(track => `${track._id}.${track.extension}`)
      );

      try {
        const trackUrls = await this.fileStorageService.getAudioUrl({
          name: trackNames,
        });

        // Map URLs back to tracks
        let urlIndex = 0;
        applications.forEach(app => {
          app.tracks = app.tracks.map(track => {
            const url = trackUrls[urlIndex++];
            return { ...track, url };
          });
        });
      } catch (error) {
        throw new ServiceException(
          'Error getting track URLs',
          ExceptionsEnum.InternalServerError,
        );
      }
    }

    return applications;
  }

  /**
   * @param value value to be updated of isFavorite or isArchived
   * @param applicationId id of the application
   * @returns updated application
   */
  async updateApplication(value: updateApplication, applicationId: string) {
    const application = await this.applicationModel.findById(
      new ObjectId(applicationId),
    );
    if (!application) {
      resourceNotFoundError('Application');
    }

    // if application status approved then delete application from database
    if (value.isApproved) {
      await this.applicationModel.deleteOne({ _id: new ObjectId(applicationId) });
      return {
        success: true,
        message: 'Application approved successfully.',
      }
    }

    await this.applicationModel.updateOne(
      { _id: new ObjectId(applicationId) },
      { ...value },
    );
    return await this.applicationModel.findById(new ObjectId(applicationId));
  }


  //check application applied or not
  async checkApplication(userId: string, id: string) {

    const application = await this.applicationModel.findOne({
      applicantId: new ObjectId(userId),
      songContestId: new ObjectId(id)
    });

    return {
      isApplied: application ? true : false
    }
  }

  /**
 * get all create collaborationsOpp List
 * @returns 
 */

  async collaborationsList({
    userId,
    filter = {},
  }: {
    userId: string;
    filter?:
    | { startDate: string; endDate: string; limit: string; page: string }
    | {};
  }): Promise<any> {

    let filters: any = {
      userId: new ObjectId(userId),
    };

    // Handle date range filtering
    if (filter['startDate'] && filter['endDate']) {
      const start = new Date(filter['startDate']);
      const end = new Date(filter['endDate']);
      if (start.toDateString() === end.toDateString()) {
        filters.createdAt = {
          $gte: start,
          $lt: new Date(start.getTime() + 86400000),
        };
      } else {
        filters.createdAt = { $gte: new Date(filter['startDate']) };
        filters.createdAt = { ...filters.createdAt, $lte: new Date(filter['endDate']), };
      }
    }

    const limit = filter['limit'] ? Number(filter['limit']) : 0;
    const skip = (Number(filter['page']) - 1) * limit;

    const collaborations = await this.getCollaborationsList({
      filters,
      sortByRecent: true,
      limit,
      skip
    });

    const total = await this.countUserActiveDocuments(userId);

    return {
      pagination: {
        total,
        page: Number(filter['page']) || 0,
        limit,
        pages: Math.ceil(total / limit),
      },
      collaborations,
    }

  }

  async countUserActiveDocuments(userId: string): Promise<number> {
    return await this.songContestModel.countDocuments({
      userId: new ObjectId(userId),
    });
  }

  async getCollaborationsList({
    filters,
    sortByRecent = false,
    limit = 0,
    skip = 0,
  }: {
    filters: any;
    sortByRecent?: boolean;
    limit?: number;
    skip?: number;
  }): Promise<any> {
    const sortDescending = -1 as -1;
    const songs: any = await this.songContestModel.aggregate([
      { $match: filters },
      ...(sortByRecent ? [{ $sort: { createdAt: sortDescending } }] : []),
      ...(typeof skip === 'number' ? [{ $skip: skip }] : []),
      ...(typeof limit === 'number' ? [{ $limit: limit }] : []),
      {
        $lookup: {
          from: 'projects',
          localField: 'projectId',
          foreignField: '_id',
          as: 'projectId',
        },
      },
      {
        $lookup: {
          from: 'styles',
          localField: 'styles',
          foreignField: '_id',
          as: 'styles',
        },
      },
      {
        $lookup: {
          from: 'skill_types',
          localField: 'seeking',
          foreignField: '_id',
          as: 'seeking',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          pipeline: [{ $project: { _id: 1, name: 1, profile_img: 1 } }],
          as: 'userId',
        },
      },
      { $unwind: '$userId' },
      {
        $lookup: {
          from: 'languages',
          localField: 'languages',
          foreignField: '_id',
          as: 'languages',
        },
      },
      {
        $lookup: {
          from: 'tracks',
          localField: 'tracks',
          foreignField: '_id',
          as: 'tracksData',
        },
      },
      {
        $set: {
          tracks: {
            $filter: {
              input: "$tracksData",
              as: "track",
              cond: { $ne: ["$$track", null] }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          collaborateWith: 1,
          userId: 1,
          projectId: 1,
          languages: 1,
          title: 1,
          tracks: 1,
          brief: 1,
          seeking: 1,
          styles: 1,
          duration: 1,
          createdAt: 1,
          updatedAt: 1,
        }
      }
    ]);

    const options = {
      isPreview: false
    }

    const trackNames = songs?.flatMap(song =>
      song.tracks?.map(track => {
        return options.isPreview
          ? `PREVIEW._${track._id}.${track?.previewExtension || 'mp3'}`
          : `${track._id}.${track.extension}`;
      }) || []
    ) || [];

    try {
      const trackUrls = await this.fileStorageService.getAudioUrl({
        name: trackNames,
      });
      let urlIndex = 0;

      return songs?.map(song => ({
        ...song,
        tracks: song.tracks.map(track => ({
          ...track,
          url: trackUrls[urlIndex++] || null,
        })),
      }));

    } catch (error) {
      throw new ServiceException(
        'Error searching from tracks URLs (getAllTracks, tracks).' +
        JSON.stringify(error),
        ExceptionsEnum.InternalServerError,
      );
    }
  }

  /**
  * get all applied collaborationsOpp List
  * @returns 
  */

  async appliedList({
    userId,
    filter = {},
  }: {
    userId: string;
    filter?:
    | { startDate: string; endDate: string; limit: string; page: string }
    | {};
  }): Promise<any> {
    let filters: any = {
      applicantId: new ObjectId(userId),
    };

    // Handle date range filtering
    if (filter['startDate'] && filter['endDate']) {
      const start = new Date(filter['startDate']);
      const end = new Date(filter['endDate']);
      if (start.toDateString() === end.toDateString()) {
        filters.createdAt = {
          $gte: start,
          $lt: new Date(start.getTime() + 86400000),
        };
      } else {
        filters.createdAt = { $gte: new Date(filter['startDate']) };
        filters.createdAt = { ...filters.createdAt, $lte: new Date(filter['endDate']), };
      }
    }

    const limit = filter['limit'] ? Number(filter['limit']) : 0;
    const skip = (Number(filter['page']) - 1) * limit;

    const collaborations = await this.getAppliedList({
      filters,
      sortByRecent: true,
      limit,
      skip
    });

    const total = await this.countDocuments(userId);

    return {
      pagination: {
        total,
        page: Number(filter['page']) || 0,
        limit,
        pages: Math.ceil(total / limit),
      },
      collaborations,
    }

  }

  async countDocuments(userId: string): Promise<number> {
    return await this.applicationModel.countDocuments({
      applicantId: new ObjectId(userId),
    });
  }

  async getAppliedList({
    filters,
    sortByRecent = false,
    limit = 0,
    skip = 0,
  }: {
    filters: any;
    sortByRecent?: boolean;
    limit?: number;
    skip?: number;
  }): Promise<any> {
    const sortDescending = -1 as -1;
    const songs = await this.applicationModel.aggregate([
      { $match: filters },
      ...(sortByRecent ? [{ $sort: { createdAt: sortDescending } }] : []),
      ...(typeof skip === 'number' ? [{ $skip: skip }] : []),
      ...(typeof limit === 'number' ? [{ $limit: limit }] : []),
      {
        $lookup: {
          from: 'tracks',
          localField: 'tracks',
          foreignField: '_id',
          as: 'tracksData',
        },
      },
      {
        $set: {
          tracks: {
            $filter: {
              input: "$tracksData",
              as: "track",
              cond: { $ne: ["$$track", null] }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'applicantId',
          foreignField: '_id',
          pipeline: [
            { $project: { name: 1, email: 1, _id: 1, profile_img: 1 } },
          ],
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: "songcontests",
          localField: 'songContestId',
          foreignField: '_id',
          as: 'songContest',
        },
      },
      { $unwind: { path: '$songContest', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'projects',
          localField: 'songContest.projectId',
          foreignField: '_id',
          as: 'songContest.projectId',
        },
      },
      {
        $lookup: {
          from: 'styles',
          localField: 'songContest.styles',
          foreignField: '_id',
          as: 'songContest.styles',
        },
      },
      {
        $lookup: {
          from: 'skill_types',
          localField: 'songContest.seeking',
          foreignField: '_id',
          as: 'songContest.seeking',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'songContest.userId',
          foreignField: '_id',
          pipeline: [{ $project: { _id: 1, name: 1, profile_img: 1 } }],
          as: 'songContest.userId',
        },
      },
      { $unwind: { path: '$songContest.userId', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'languages',
          localField: 'songContest.languages',
          foreignField: '_id',
          as: 'songContest.languages',
        },
      },
      {
        $lookup: {
          from: 'tracks',
          localField: 'songContest.tracks',
          foreignField: '_id',
          as: 'songContest.tracksData',
        },
      },
      {
        $set: {
          "songContest.tracks": {
            $filter: {
              input: "$songContest.tracksData",
              as: "track",
              cond: { $ne: ["$$track", null] }
            }
          }
        }
      },

      {
        $project: {
          _id: 1,
          user: 1,
          songContest: {
            _id: 1,
            collaborateWith: 1,
            userId: 1,
            projectId: 1,
            languages: 1,
            title: 1,
            tracks: 1,
            brief: 1,
            seeking: 1,
            styles: 1,
            duration: 1,
            createdAt: 1,
            updatedAt: 1,
          },
          brief: 1,
          tracks: 1,
          links: 1,
          isFavorite: 1,
          isArchived: 1,
          createdAt: 1,
          updatedAt: 1,
        }
      }
    ]);

    const options = {
      isPreview: false
    }

    const trackNames = songs?.flatMap(song =>
      song.tracks?.map(track => {
        return options.isPreview
          ? `PREVIEW._${track._id}.${track?.previewExtension || 'mp3'}`
          : `${track._id}.${track.extension}`;
      }) || []
    ) || [];

    try {
      const trackUrls = await this.fileStorageService.getAudioUrl({
        name: trackNames,
      });
      let urlIndex = 0;

      return songs?.map(song => ({
        ...song,
        tracks: song.tracks.map(track => ({
          ...track,
          url: trackUrls[urlIndex++] || null,
        })),
      }));

    } catch (error) {
      throw new ServiceException(
        'Error searching from tracks URLs (getAllTracks, tracks).' +
        JSON.stringify(error),
        ExceptionsEnum.InternalServerError,
      );
    }
  }
}