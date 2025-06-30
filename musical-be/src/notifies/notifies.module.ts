import { Module, Provider, OnModuleInit, Logger, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotifiesController } from './notifies.controller';
import { NotifiesService } from './notifies.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { GeneralExceptionFilter } from './filters/generalException.filter';
import { NotificationFormatterService } from './services/notificationFormatter.service';
import { Expo, ExpoClientOptions } from 'expo-server-sdk';
import { PushNotificationsService } from './services/pushNotifications.service';
import { SocketGateway } from './socket/socket.gateway';
import SocketService from './socket/socket.service';
import { SchemasModule } from '../schemas/schemas.module';
import { PubSubService } from './services/pubSub.service';
import { SmsService } from './services/sms.service';
import { TemplateService } from './services/template.services';
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
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          uri: configService.get<string>('MONGODB_URI'),
        };
      },
      inject: [ConfigService],
    }),
    MailerModule.forRoot({
      transport: {
        host: configService.get<string>('EMAIL_HOST'),
        secure: false,
        auth: {
          user: configService.get<string>('EMAIL_USER'),
          pass: configService.get<string>('EMAIL_PASSWORD'),
        },
      },
      defaults: {
        from: configService.get<string>('EMAIL_FROM'),
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    // Sentry module
    SentryModule.forRoot({
      dsn: process.env.SENTRY_DNS,
      debug: process.env.SENTRY_DEBUG === 'true',
      environment: process.env.SENTRY_ENV,
      release: process.env.SENTRY_RELEASE,
    }),
  ],
  controllers: [NotifiesController],
  providers: [
    NotifiesService,
    SocketGateway,
    SocketService,
    NotificationFormatterService,
    expoProvider,
    PushNotificationsService,
    GeneralExceptionFilter,
    PubSubService,
    SmsService,
    TemplateService,
    UserActivityService
  ],
  exports: [
    NotifiesService,
    SocketGateway,
    SocketService,
    NotificationFormatterService,
    expoProvider,
    PushNotificationsService,
    GeneralExceptionFilter,
    PubSubService,
    SmsService,
    TemplateService,
    UserActivityService
  ],
})
export class NotifiesModule implements OnModuleInit {
  //Define the microservice to connect
  constructor() {
    return;
  }

  /**
   * Defines the on moudule init function to subscribe to reply topics
   * @function
   */
  async onModuleInit() {
    return Logger.log('Notifies module initialized');
  }

  /**
   * Defines the on moudule destroy function to close connection
   * @function
   */
  async onModuleDestroy() {
    return Logger.log('Notifies module destroyed');
  }
}
