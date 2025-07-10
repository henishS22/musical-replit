import {
  Inject,
  Logger,
  Module,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { UsersPerDeviceAcrossTime } from './helper/services/reports/users/usersPerDeviceAcrossTime.service';
import { InvitesSent } from './helper/services/reports/users/invitesSent.service';
import { CreatedProjects } from './helper/services/reports/projects/createdProjects';
import { PostedCollaborations } from './helper/services/reports/collaborations/postedCollaborations.service';
import { AverageUploadedFiles } from './helper/services/reports/tracks/averageUploadedFiles.service';
import { ReportGeneratorService } from './helper/services/reports/reportGenerator.service';
import { CreatedProjectsPerUserAcrossTime } from './helper/services/reports/projects/createdProjectsPerUserAcrossTime.service';
import { PostedCollaborationsPerUserAcrossTime } from './helper/services/reports/collaborations/postedCollaborationsPerUserAcrossTime.service';
import { UploadedFilesPerUserAcrossTime } from './helper/services/reports/tracks/uploadedFilesPerUserAcrossTime.service';
import { GeneralExceptionFilter } from './helper/filters/generalException.filter';
import { MongooseModule } from '@nestjs/mongoose';
import {
  City,
  CitySchema,
  Collaboration,
  CollaborationSchema,
  Country,
  CountrySchema,
  Invite,
  InviteSchema,
  Project,
  ProjectSchema,
  SkillLevelSchema,
  SkillTypeSchema,
  State,
  StateSchema,
  Style,
  StyleSchema,
  Track,
  TrackSchema,
  User,
  UserSchema,
} from '../schemas/schemas';
import { FileStorageModule } from '../file-storage/fileStorage.module';

// Create the instance for the config service
const configService = new ConfigService();

@Module({
  imports: [
    ConfigModule,
    FileStorageModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Style.name, schema: StyleSchema },
      { name: Country.name, schema: CountrySchema },
      { name: State.name, schema: StateSchema },
      { name: City.name, schema: CitySchema },
      { name: Collaboration.name, schema: CollaborationSchema },
      { name: Invite.name, schema: InviteSchema },
      { name: 'skill_type', schema: SkillTypeSchema },
      { name: 'skill_level', schema: SkillLevelSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Track.name, schema: TrackSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [
    ReportsService,
    UsersPerDeviceAcrossTime,
    InvitesSent,
    CreatedProjects,
    PostedCollaborations,
    AverageUploadedFiles,
    ReportGeneratorService,
    CreatedProjectsPerUserAcrossTime,
    PostedCollaborationsPerUserAcrossTime,
    UploadedFilesPerUserAcrossTime,
    GeneralExceptionFilter,
  ],
})
export class ReportsModule implements OnModuleInit, OnModuleDestroy {
  //Define the microservice to connect
  constructor() { } // @Inject('API_REPORTS') private readonly clientKafka: ClientKafka,

  /**
   * Defines the on moudule init function to subscribe to reply topics
   * @function
   */
  async onModuleInit() {
    await Logger.log('Reports module Init');
    // //Get the array with all messagens defined in the controller, called with service.sendMessage
    // getAllTopicsArray().forEach((key) =>
    //   this.clientKafka.subscribeToResponseOf(`${key}`),
    // );
    // await this.clientKafka.connect();
  }

  /**
   * Defines the on moudule destroy function to close connection
   * @function
   */
  async onModuleDestroy() {
    await Logger.log('Reports module Destroy');

    // await this.clientKafka.close();
  }
}
