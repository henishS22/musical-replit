// import { Inject, Injectable } from '@nestjs/common';
// import { ClientKafka } from '@nestjs/microservices';
// import { Observable } from 'rxjs';

// @Injectable()
// export class ReportsService {
//   constructor(
//     // @Inject('API_REPORTS') private readonly clientKafka: ClientKafka,
//   ) { }

//   /**
//    * Define the function to set the message to the microservice
//    * @function
//    * @param {string} pattern - The route name of the user microservice.
//    * @param {object} payload - The object that will be sent to microservice.
//    * @returns {Observable<T>} - Returns a observable of type T
//    */
//   sendMessage(pattern: string, payload: any = {}): any {
//     // return this.clientKafka.send(pattern, payload);
//   }
// }

/**
 *  @file App main service file. Defines the services to be used in the microservice.
 *  @author Rafael Marques Siqueira
 *  @exports ReportsService
 */

import { Injectable } from '@nestjs/common';
import { endOfDay, startOfDay } from 'date-fns';
import {
  PostedCollaborations,
  PostedCollaborationsReportValue,
} from './helper/services/reports/collaborations/postedCollaborations.service';
import {
  PostedCollaborationsPerUserAcrossTime,
  PostedCollaborationsPerUserAcrossTimeGroupBy,
} from './helper/services/reports/collaborations/postedCollaborationsPerUserAcrossTime.service';
import {
  GenericReport,
  GroupedReport,
  ListReport,
  Report,
} from './helper/services/reports/IReportGenerator.interface';
import {
  CreatedProjects,
  CreatedProjectsReportValue,
} from './helper/services/reports/projects/createdProjects';
import {
  CreatedProjectsPerUserAcrossTime,
  CreatedProjectsPerUserAcrossTimeGroupBy,
  CreatedProjectsPerUserAcrossTimeReportGroup,
} from './helper/services/reports/projects/createdProjectsPerUserAcrossTime.service';
import { ReportGeneratorService } from './helper/services/reports/reportGenerator.service';
import {
  AverageUploadedFiles,
  AverageUploadedFilesGroupBy,
  AverageUploadedFilesServiceReportValue,
} from './helper/services/reports/tracks/averageUploadedFiles.service';
import {
  MediaType,
  UploadedFilesPerUserAcrossTime,
  UploadedFilesPerUserAcrossTimeGroupBy,
  UploadedFilesPerUserAcrossTimeReportGroup,
} from './helper/services/reports/tracks/uploadedFilesPerUserAcrossTime.service';
import {
  InviterReportItem,
  InvitesSent,
} from './helper/services/reports/users/invitesSent.service';
import {
  UsersPerDeviceAcrossTime,
  UsersPerDeviceAcrossTimeReportGroup,
} from './helper/services/reports/users/usersPerDeviceAcrossTime.service';
import {
  Project,
  ProjectDocument,
  Track,
  TrackDocument,
  User,
  UserDocument,
} from '../schemas/schemas';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { FileStorageService } from '../file-storage/fileStorage.service';
import ServiceException from '../users/exceptions/ServiceException';
import { ExceptionsEnum } from '../utils/enums';
type ReportResult<T extends Report> = T['data'];

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Track.name) private trackModel: Model<TrackDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly usersPerDeviceAcrossTimeReportGeneratorService: UsersPerDeviceAcrossTime,
    private readonly invitesSentReportGeneratorService: InvitesSent,
    private readonly createdProjectsReportGeneratorService: CreatedProjects,
    private readonly createdProjectsPerUserAcrossTimeReportGeneratorService: CreatedProjectsPerUserAcrossTime,
    private readonly postedCollaborationsReportGeneratorService: PostedCollaborations,
    private readonly postedCollaborationsPerUserAcrossTimeReportGeneratorService: PostedCollaborationsPerUserAcrossTime,
    private readonly uploadedFilesPerUserAcrossTimeReportGeneratorService: UploadedFilesPerUserAcrossTime,
    private readonly averageUploadedFilesReportGeneratorService: AverageUploadedFiles,
    private readonly reportsGeneratorService: ReportGeneratorService,
    private readonly fileStorageService: FileStorageService,

  ) { }

  async generateUsersPerDeviceAcrossTimeReport(
    startAt: Date,
    endAt: Date,
    groupBy: 'day' | 'month' | 'year' = 'day',
  ): Promise<ReportResult<GroupedReport<UsersPerDeviceAcrossTimeReportGroup>>> {
    const reportGenerator =
      await this.usersPerDeviceAcrossTimeReportGeneratorService.create(
        startOfDay(startAt),
        endOfDay(endAt),
        groupBy,
      );

    const result = await this.reportsGeneratorService.generateCachedReport(
      reportGenerator,
    );

    return result.data;
  }

  async generateInvitesSentReport(
    startAt: Date,
    endAt: Date,
  ): Promise<ReportResult<ListReport<InviterReportItem>>> {
    const reportGenerator = await this.invitesSentReportGeneratorService.create(
      startOfDay(startAt),
      endOfDay(endAt),
    );

    const result = await this.reportsGeneratorService.generateCachedReport(
      reportGenerator,
    );

    return result.data;
  }

  async generateCreatedProjectsReport(
    startAt: Date,
    endAt: Date,
  ): Promise<ReportResult<GenericReport<CreatedProjectsReportValue>>> {
    const reportGenerator =
      await this.createdProjectsReportGeneratorService.create(startAt, endAt);

    const result = await this.reportsGeneratorService.generateCachedReport(
      reportGenerator,
    );

    return result.data;
  }

  async generatePostedCollaborationsReport(
    startAt: Date,
    endAt: Date,
  ): Promise<ReportResult<GenericReport<PostedCollaborationsReportValue>>> {
    const reportGenerator =
      await this.postedCollaborationsReportGeneratorService.create(
        startOfDay(startAt),
        endOfDay(endAt),
      );

    const result = await this.reportsGeneratorService.generateCachedReport(
      reportGenerator,
    );

    return result.data;
  }

  async generateAverageUploadedFilesReport(
    startAt: Date,
    endAt: Date,
    groupBy: AverageUploadedFilesGroupBy,
  ): Promise<
    ReportResult<GenericReport<AverageUploadedFilesServiceReportValue>>
  > {
    const reportGenerator =
      await this.averageUploadedFilesReportGeneratorService.create(
        startOfDay(startAt),
        endOfDay(endAt),
        groupBy,
      );

    const result = await this.reportsGeneratorService.generateCachedReport(
      reportGenerator,
    );

    return result.data;
  }

  async generateCreatedProjectsPerUserAcrossTimeReport(
    startAt: Date,
    endAt: Date,
    groupBy: CreatedProjectsPerUserAcrossTimeGroupBy,
  ): Promise<
    ReportResult<GroupedReport<CreatedProjectsPerUserAcrossTimeReportGroup>>
  > {
    const reportGenerator =
      await this.createdProjectsPerUserAcrossTimeReportGeneratorService.create(
        startOfDay(startAt),
        endOfDay(endAt),
        groupBy,
      );

    const result = await this.reportsGeneratorService.generateCachedReport(
      reportGenerator,
    );

    return result.data;
  }

  async getPostedCollaborationsPerUserAcrossTimeReport(
    startAt: Date,
    endAt: Date,
    groupBy: PostedCollaborationsPerUserAcrossTimeGroupBy,
  ): Promise<
    ReportResult<GroupedReport<CreatedProjectsPerUserAcrossTimeReportGroup>>
  > {
    const reportGenerator =
      await this.postedCollaborationsPerUserAcrossTimeReportGeneratorService.create(
        startOfDay(startAt),
        endOfDay(endAt),
        groupBy,
      );

    const result = await this.reportsGeneratorService.generateCachedReport(
      reportGenerator,
    );

    return result.data;
  }

  async getUploadedFilesPerUserAcrossTimeReport(
    startAt: Date,
    endAt: Date,
    groupBy: UploadedFilesPerUserAcrossTimeGroupBy,
    mediaType: MediaType,
  ): Promise<
    ReportResult<GroupedReport<UploadedFilesPerUserAcrossTimeReportGroup>>
  > {
    const reportGenerator =
      await this.uploadedFilesPerUserAcrossTimeReportGeneratorService.create(
        startOfDay(startAt),
        endOfDay(endAt),
        groupBy,
        mediaType,
      );

    const result = await this.reportsGeneratorService.generateCachedReport(
      reportGenerator,
    );

    return result.data;
  }

  async searchByName(searchText: string, owner: string) {
    const query = { name: { $regex: searchText, $options: 'i' } };

    const projects = await this.projectModel
      .find({ ...query, user: new ObjectId(owner) })
      .select('_id name');
    const tracks = await this.trackModel
      .find({ ...query, user_id: new ObjectId(owner) })
      .select('_id name url duration extension name artwork');
    const artists = await this.userModel
      .find({ ...query, _id: { $ne: new ObjectId(owner) } })
      .select('_id name');

    const trackNames = tracks.map(track => `${track._id}.${track.extension}`);

    try {
      const trackUrls = await this.fileStorageService.getAudioUrl({
        name: trackNames,
      });

      tracks.forEach((track, index) => {
        const url = trackUrls[index];
        if (url) {
          (track as any)._doc.url = url;
        }
      });
    } catch (error) {
      console.error('Error retrieving track URLs:', error);
    }

    return {
      projects,
      tracks,
      artists,
    };
  }
}
