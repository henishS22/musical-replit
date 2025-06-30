import { HttpModule } from '@nestjs/axios';
import {
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleDestroy,
  OnModuleInit,
  forwardRef,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FolderController,
  LyricsController,
  TagsController,
  TracksController,
} from './tracks.controller';
import { FolderService, TracksService, TagsService } from './tracks.service';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { GeneralExceptionFilter } from './filters/generalException.filter';
import { TrackLyricsService } from './services/trackLyrics.service';
import { SchemasModule } from '../schemas/schemas.module';
import { ProjectsModule } from '../projects/projects.module';
import { NftsModule } from '../nfts/nfts.module';
import { FileStorageModule } from '../file-storage/fileStorage.module';
import { FileStorageService } from '../file-storage/fileStorage.service';
import { ProjectsService } from '../projects/projects.service';
import { NftsService } from '../nfts/nfts.service';
import { KazmService } from '../kazm/kazm.service';
import * as multer from 'multer';
import {
  DEFAULT_AUDIO_FILE_SIZE_LIMIT,
  DEFAULT_IMAGE_FILE_SIZE_LIMIT,
  ALLOWED_IMAGE_MIMETYPES,
  ALLOWED_AUDIO_MIMETYPES,
  DEFAULT_AUDIO_FILE_REDIS_CACHE_TTL,
  ALLOWED_VIDEO_MIMETYPES,
  ALLOWED_PROJECT_MIMETYPES,
} from './utils/consts';
import { UserActivityService } from '../user-activity/user-activity.service';

@Module({
  imports: [
    //HttpAxios Module
    SchemasModule,
    forwardRef(() => ProjectsModule),
    FileStorageModule,
    NftsModule,
    HttpModule.register({
      // Set response type for files get
      responseType: 'arraybuffer',
      responseEncoding: 'binary',
    }),
    //Load env data
    ConfigModule.forRoot(),
    //Mongodb
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          uri: configService.get<string>('MONGODB_URI'),
        };
      },
      inject: [ConfigService],
    }),
    // Sentry
    SentryModule.forRoot({
      dsn: process.env.SENTRY_DNS,
      debug: process.env.SENTRY_DEBUG === 'true',
      environment: process.env.SENTRY_ENV,
      release: process.env.SENTRY_RELEASE,
    }),
  ],
  controllers: [
    TracksController,
    TagsController,
    FolderController,
    LyricsController,
  ],
  providers: [
    FolderService,
    GeneralExceptionFilter,
    TrackLyricsService,
    TagsService,
    TracksService,
    FileStorageService,
    ProjectsService,
    NftsService,
    KazmService,
    UserActivityService
  ],
  exports: [TracksService, TrackLyricsService, TagsService, FolderService, UserActivityService],
})
export class TracksModule implements NestModule, OnModuleInit, OnModuleDestroy {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        multer({
          // limits: {
          //   fileSize: 10 * 1024 * 1024, // 10 MB
          // },
          fileFilter: (req, file, cb) => {
            if (!file) {
              return cb(null, false);
            }
            if (
              !ALLOWED_AUDIO_MIMETYPES.includes(file.mimetype) &&
              !ALLOWED_IMAGE_MIMETYPES.includes(file.mimetype) &&
              !ALLOWED_VIDEO_MIMETYPES.includes(file.mimetype) &&
              !ALLOWED_PROJECT_MIMETYPES.includes(file.mimetype)
            ) {
              cb(null, false);
              Logger.error('Invalid file type');
              return;
            }
            cb(null, true);
          },
        }).fields([
          { name: 'file', maxCount: 1 },
          { name: 'imageWaveSmall', maxCount: 1 },
          { name: 'imageWaveBig', maxCount: 1 },
          { name: 'artwork', maxCount: 1 },
        ]),
      )
      .forRoutes(TracksController);
  }
  //Define the microservice to connect
  constructor() {
    return;
  }

  /**
   * Defines the on moudule init function to subscribe to reply topics
   * @function
   */
  async onModuleInit() {
    return Logger.log('Tracks Module initialized');
  }

  /**
   * Defines the on moudule destroy function to close connection
   * @function
   */
  async onModuleDestroy() {
    return Logger.log('Tracks Module destroyed');
  }
}
