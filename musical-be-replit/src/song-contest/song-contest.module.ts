import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import Expo, { ExpoClientOptions } from 'expo-server-sdk';
import {
  Logger,
  Module,
  OnModuleDestroy,
  OnModuleInit,
  Provider,
} from '@nestjs/common';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { NftsService } from '../nfts/nfts.service';
import { SongContestService } from './song-contest.service';
import { NotifiesService } from '../notifies/notifies.service';
import { FeedsService } from '../projects/services/feeds.service';
import { FileStorageService } from '../file-storage/fileStorage.service';
import { ProjectTracksService } from '../projects/services/projectTracks.service';
import { ProjectUpdateService } from '../projects/services/projectUpdate.service';
import { ProjectGetterService } from '../projects/services/projectGetter.service';
import { ProjectReleasesService } from '../projects/services/projectReleases.service';
import { ProjectNotifyService } from '../projects/services/projectNotifications.service';
import { PushNotificationsService } from '../notifies/services/pushNotifications.service';
import { NotificationFormatterService } from '../notifies/services/notificationFormatter.service';

import { SchemasModule } from '../schemas/schemas.module';
import { FileStorageModule } from '../file-storage/fileStorage.module';

import { SongContestController } from './song-contest.controller';
import { UserActivityService } from '../user-activity/user-activity.service';

const configService = new ConfigService();
const expoProvider: Provider<Expo> = {
  provide: 'EXPO',
  useFactory: (configService: ConfigService) => {
    const accessToken = configService.get<string>('EXPO_ACCESS_TOKEN');
    const options: any = {};

    if (accessToken) {
      options.accessToken = accessToken;
    }

    return new Expo(options);
  },
  inject: [ConfigService],
};

@Module({
  imports: [
    SchemasModule,
    FileStorageModule,
    HttpModule.register({
      responseType: 'arraybuffer',
      responseEncoding: 'binary',
    }),
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
      useFactory: async (ConfigService: ConfigService) => {
        return {
          uri: ConfigService.get<string>('MONGODB_URI'),
        };
      },
      inject: [ConfigService],
    }),

    //Sentry module
    SentryModule.forRoot({
      dsn: process.env.SENTRY_DNS,
      debug: process.env.SENTRY_DEBUG === 'true',
      environment: process.env.SENTRY_ENV,
      release: process.env.SENTRY_RELEASE,
    }),
  ],
  controllers: [SongContestController],
  providers: [
    SongContestService,
    FileStorageService,
    ProjectGetterService,
    ProjectReleasesService,
    ProjectTracksService,
    NftsService,
    ProjectUpdateService,
    ProjectNotifyService,
    NotifiesService,
    FeedsService,
    NotificationFormatterService,
    // ProjectsService,
    PushNotificationsService,
    UserActivityService,
    expoProvider,
  ],
  exports: [SongContestService, FileStorageService, UserActivityService, expoProvider],
})
export class SongContestModule implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SongContestModule.name);
  /**
   * Defines the on moudule init function to subscribe to reply topics
   * @function
   */
  async onModuleInit() {
    return Logger.log('song contest module initialized');
  }

  async onModuleDestroy() {
    return Logger.log('song contest module destroyed');
  }
}
