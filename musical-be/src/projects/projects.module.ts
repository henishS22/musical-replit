/**
 *  @file App main module file. Defines the module settings, like schemas, db connections and more.
 *  @author Rafael Marques Siqueira
 *  @exports AppModule
 */

import { RedisService } from '@liaoliaots/nestjs-redis';
import {
  Inject,
  Module,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
  forwardRef,
  NestModule,
  MiddlewareConsumer,
} from '@nestjs/common';
import { ClientKafka, ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FeedsService } from './services/feeds.service';
import { FileStorageModule } from '../file-storage/fileStorage.module';
import { FileStorageService } from '../file-storage/fileStorage.service';
import { GeneralExceptionFilter } from './filters/generalException.filter';
import { getAllExternalTopicsArray } from './utils/external.topics.definitions';
import { HttpModule } from '@nestjs/axios';
import { LyricsService } from './services/lyrics.service';
import { MongooseModule } from '@nestjs/mongoose';
import { NftsModule } from '../nfts/nfts.module';
import { ProjectNotifyService } from './services/projectNotifications.service';
import { ProjectGetterService } from './services/projectGetter.service';
import { ProjectNftsService } from './services/projectNfts.service';
import { ProjectReleasesService } from './services/projectReleases.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectTracksService } from './services/projectTracks.service';
import { ProjectUpdateService } from './services/projectUpdate.service';
import { SchemasModule } from '../schemas/schemas.module';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { TracksModule } from '../tracks/tracks.module';
import { TracksService } from '../tracks/tracks.service';
import { TrackLyricsService } from '../tracks/services/trackLyrics.service';
import { NotifiesModule } from '../notifies/notifies.module';
import { NotifiesService } from '../notifies/notifies.service';
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

// Create the instance for the config service
const configService = new ConfigService();

@Module({
  imports: [
    forwardRef(() => TracksModule),
    NotifiesModule,
    SchemasModule,
    NftsModule,
    FileStorageModule,
    //HttpAxios Module
    HttpModule.register({
      // Set response type for files get
      responseType: 'arraybuffer',
      responseEncoding: 'binary',
    }),
    //Load env data
    ConfigModule.forRoot(),
    ClientsModule.register([
      {
        name: 'PROJECTS',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'projects',
            brokers: [configService.get<string>('KAFKA_URL')],
            authenticationTimeout: 600000,
            ssl: configService.get<string>('APP_ENV') !== 'development' && {
              rejectUnauthorized: false,
              ca: [
                `-----BEGIN CERTIFICATE-----${configService.get<string>(
                  'CA_PEM',
                )}-----END CERTIFICATE-----`,
              ],
            },
            sasl: configService.get<string>('APP_ENV') !== 'development' && {
              mechanism: 'plain',
              username: configService.get<string>('KAFKA_API_KEY'),
              password: configService.get<string>('KAFKA_API_SECRET'),
            },
          },
          consumer: {
            groupId: 'projects-consumer',
            allowAutoTopicCreation: true,
            sessionTimeout: 10000,
            heartbeatInterval: 3333,
            rebalanceTimeout: 30000,
          },
          producer: {
            allowAutoTopicCreation: true,
            transactionTimeout: 300000,
          },
        },
      },
    ]),
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

    // Sentry module
    SentryModule.forRoot({
      dsn: process.env.SENTRY_DNS,
      debug: process.env.SENTRY_DEBUG === 'true',
      environment: process.env.SENTRY_ENV,
      release: process.env.SENTRY_RELEASE,
    }),
  ],
  controllers: [ProjectsController],
  providers: [
    FileStorageService,
    ProjectGetterService,
    ProjectsService,
    ProjectUpdateService,
    ProjectNotifyService,
    GeneralExceptionFilter,
    LyricsService,
    FeedsService,
    ProjectNftsService,
    ProjectReleasesService,
    ProjectTracksService,
    TracksService,
    TrackLyricsService,
    NotifiesService,
    KazmService,
    UserActivityService
  ],
  exports: [
    FileStorageService,
    ProjectGetterService,
    ProjectsService,
    ProjectUpdateService,
    ProjectNotifyService,
    GeneralExceptionFilter,
    LyricsService,
    FeedsService,
    ProjectNftsService,
    ProjectReleasesService,
    ProjectTracksService,
    TracksService,
    TrackLyricsService,
    NotifiesService,
    KazmService,
    UserActivityService
  ],
})
export class ProjectsModule implements NestModule, OnModuleInit, OnModuleDestroy {

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        multer({
          limits: {
            fileSize: DEFAULT_IMAGE_FILE_SIZE_LIMIT,
          },
          fileFilter: (req, file, cb) => {
            if (!file) {
              return cb(null, false);
            }
            if (
              !ALLOWED_IMAGE_MIMETYPES.includes(file.mimetype) &&
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
          { name: 'artwork', maxCount: 1 },
          { name: 'coverImage', maxCount: 1 },
        ]),
      )
      .forRoutes(ProjectsController);
  }

  private readonly logger = new Logger(ProjectsModule.name);

  //Define the microservice to connect
  constructor(
    // @Inject('PROJECTS') private readonly clientKafka: ClientKafka,
    private readonly redisService: RedisService,
  ) { }
  /**
   * Defines the on moudule init function to subscribe to reply topics
   * @function
   */

  async onModuleInit() {
    //Defines the external topics dependencies to be used in this service
    try {
      const client = this.redisService.getClient(); // Assuming you're using the default client
      await client.ping();
      this.logger.log('Connected to Redis successfully');

      // //Defines the external topics dependencies to be used in this service
      // //Subscribe to the replies
      // [
      //   ...getAllExternalTopicsArray('feeds'),
      //   ...getAllExternalTopicsArray('general'),
      // ].forEach((key) => {
      //   this.clientKafka.subscribeToResponseOf(`${key}`);
      //   console.log(`Subscribed to response of: ${key}`);
      // });

      // await this.clientKafka.connect();
    } catch (error) {
      this.logger.error(
        'error initializing project module:',
        JSON.stringify(error),
      );
    }
  }

  /**
   * Defines the on moudule destroy function to close connection
   * @function
   */
  async onModuleDestroy() {
    // await this.clientKafka.close();
    return Logger.log('Projects Module destroyed');
  }
}
