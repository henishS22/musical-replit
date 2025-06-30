import { Logger, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { AyrshareController } from './ayrshare.controller';
import { AyrshareService } from './ayrshare.service';
import { SchemasModule } from '../schemas/schemas.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsController } from './controllers/posts.controller';
import { PostsService } from './services/posts.services';
import { CommentsController } from './controllers/comments.controller';
import { CommentsService } from './services/comments.services';
import { MediaController } from './controllers/media.controller';
import { MediaService } from './services/media.services';
import { AnalyticsController } from './controllers/analytics.controller';
import { AnalyticsService } from './services/analytics.services';
import { MessageController } from './controllers/message.controller';
import { MessageService } from './services/message.services';
import { WebhookController } from './controllers/webhook.controller';
import { WebhookService } from './services/webhook.services';

@Module({
  imports: [
    SchemasModule,
    ConfigModule.forRoot(),
    HttpModule.register({}),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          uri: configService.get<string>('MONGODB_URI'),
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AyrshareController,
    PostsController,
    CommentsController,
    MediaController,
    AnalyticsController,
    MessageController,
    WebhookController,
  ],
  providers: [
    AyrshareService,
    PostsService,
    CommentsService,
    MediaService,
    AnalyticsService,
    MessageService,
    WebhookService,
  ],
  exports: [
    AyrshareService,
    PostsService,
    CommentsService,
    MediaService,
    AnalyticsService,
    MessageService,
    WebhookService,
  ],
})
export class AyrshareModule implements OnModuleInit {
  constructor() {
    return;
  }

  async onModuleInit() {
    return Logger.log('Ayrshare module initialized');
  }

  async onModuleDestroy() {
    return Logger.log('Ayrshare module destroyed');
  }
}
