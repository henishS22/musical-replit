// import { RedisModule } from '@liaoliaots/nestjs-redis';
import {
  BadRequestException,
  // Inject,
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
  Provider,
  forwardRef,
} from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { ClientKafka } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { GeneralExceptionFilter } from './filters/generalException.filter';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { ArtistsService } from './services/artists.service';
// import { getAllExternalTopicsArray } from './utils/external.topics.definitions';
import { Client as HubspotClient } from '@hubspot/api-client';
import { HubspotService } from './services/hubspot.service';
// import { FeedsService } from './services/feeds.service';
import {
  SkillLevelService,
  SkillTypeService,
  StylesService,
} from './services/skills.service';
import { SkillsController } from './controllers/skills.controller';
import { FollowersController } from './controllers/followers.controller';
import { FollowersService } from './services/followers.service';
import { NotifiesService } from '../notifies/notifies.service';
import { SchemasModule } from '../schemas/schemas.module';
import { ProjectsModule } from '../projects/projects.module';
import { ChatModule } from '../chat/chat.module';
import { FileStorageModule } from '../file-storage/fileStorage.module';
import { ChatService } from '../chat/chat.service';
import { FileStorageService } from '../file-storage/fileStorage.service';
import { ProjectsService } from '../projects/projects.service';
import { TracksModule } from '../tracks/tracks.module';
import { TracksService } from '../tracks/tracks.service';
import { NftsModule } from '../nfts/nfts.module';
import { NftsService } from '../nfts/nfts.service';
import { NotifiesModule } from '../notifies/notifies.module';
import { KazmService } from '../kazm/kazm.service';
import { AyrshareService } from '../ayrshare/ayrshare.service';
import { CoinflowService } from '../coinflow/coinflow.service';
import { AyrshareController } from '../ayrshare/ayrshare.controller';
import * as multer from 'multer';
import {
  DEFAULT_AUDIO_FILE_SIZE_LIMIT,
  DEFAULT_IMAGE_FILE_SIZE_LIMIT,
  ALLOWED_IMAGE_MIMETYPES,
  ALLOWED_AUDIO_MIMETYPES,
  DEFAULT_AUDIO_FILE_REDIS_CACHE_TTL,
  ALLOWED_VIDEO_MIMETYPES,
  ALLOWED_PROJECT_MIMETYPES,
} from './utils/constants';
import { UserActivityModule } from '../user-activity/user-activity.module';
import { UserActivityService } from '../user-activity/user-activity.service';
import { SmsService } from '../notifies/services/sms.service';

const hubspotProvider: Provider<HubspotClient> = {
  provide: 'HUBSPOT',
  useFactory: (configService: ConfigService) => {
    const accessToken = configService.get('HUBSPOT_ACCESS_TOKEN');

    return new HubspotClient({ accessToken });
  },
  inject: [ConfigService],
};

@Module({
  imports: [
    //Kafka clients
    SchemasModule,
    forwardRef(() => ChatModule),
    forwardRef(() => FileStorageModule),
    forwardRef(() => ProjectsModule),
    NotifiesModule,
    NftsModule,
    TracksModule,
    ConfigModule.forRoot(),
    HttpModule.register({
      // Set response type for files get
      // responseType: 'arraybuffer',
      // responseEncoding: 'binary',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          uri: configService.get<string>('MONGODB_URI'),
        };
      },
      inject: [ConfigService],
    }),
    SentryModule.forRoot({
      dsn: process.env.SENTRY_DNS,
      debug: process.env.SENTRY_DEBUG === 'true',
      environment: process.env.SENTRY_ENV,
      release: process.env.SENTRY_RELEASE,
    }),
  ],
  controllers: [
    UsersController,
    SkillsController,
    FollowersController,
    AyrshareController,
  ],
  providers: [
    // kafkaClientProvider,
    ArtistsService,
    GeneralExceptionFilter,
    hubspotProvider,
    HubspotService,
    // FeedsService,
    SkillLevelService,
    SkillTypeService,
    StylesService,
    FollowersService,
    NotifiesService,
    UsersService,
    ChatService,
    FileStorageService,
    ProjectsService,
    NftsService,
    TracksService,
    NotifiesService,
    KazmService,
    AyrshareService,
    CoinflowService,
    UserActivityService,
    SmsService
  ],
  exports: [
    // kafkaClientProvider,
    ArtistsService,
    GeneralExceptionFilter,
    hubspotProvider,
    HubspotService,
    // FeedsService,
    SkillLevelService,
    SkillTypeService,
    StylesService,
    FollowersService,
    NotifiesService,
    UsersService,
    ChatService,
    FileStorageService,
    ProjectsService,
    NftsService,
    TracksService,
    NotifiesService,
    AyrshareService,
    CoinflowService,
    UserActivityService,
    SmsService
  ],
})
export class UsersModule implements NestModule, OnModuleInit {

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        multer({
          limits: {
            fileSize: Math.max(DEFAULT_AUDIO_FILE_SIZE_LIMIT, DEFAULT_IMAGE_FILE_SIZE_LIMIT)
          },
          fileFilter: (req, file, cb) => {
            if (!file) {
              return cb(null, true);
            }
            if (
              !ALLOWED_AUDIO_MIMETYPES.includes(file.mimetype) &&
              !ALLOWED_IMAGE_MIMETYPES.includes(file.mimetype) &&
              !ALLOWED_VIDEO_MIMETYPES.includes(file.mimetype) &&
              !ALLOWED_PROJECT_MIMETYPES.includes(file.mimetype)
            ) {
              const error = new BadRequestException('Invalid file type');
              (error as any).code = 'INVALID_FILE_TYPE';
              return cb(error);
            }
            cb(null, true);
          },
        }).fields([
          { name: 'file', maxCount: 1 },
          { name: 'artwork', maxCount: 1 },
        ]),
      )
      .forRoutes(UsersController);
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
    // try {
    //   [...getAllExternalTopicsArray('feeds')].forEach((key) =>
    //     this.clientKafka.subscribeToResponseOf(`${key}`),
    //   );
    // } catch (error) {
    //   Logger.log('error initializing users module', JSON.stringify(error));
    // }

    // await this.clientKafka.connect();
    return Logger.log('Users module initialized');
  }

  /**
   * Defines the on moudule destroy function to close connection
   * @function
   */
  async onModuleDestroy() {
    return Logger.log('Users module destroyed');
  }
}
