import {
  Logger,
  Module,
  OnModuleDestroy,
  OnModuleInit,
  forwardRef,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { GeneralExceptionFilter } from './filters/generalException.filter';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { SchemasModule } from '../schemas/schemas.module';
import { ProjectsModule } from '../projects/projects.module';
import { FileStorageModule } from '../file-storage/fileStorage.module';
import { KazmService } from '../kazm/kazm.service';

@Module({
  imports: [
    //Load env data
    SchemasModule,
    forwardRef(() => UsersModule),
    forwardRef(() => ProjectsModule),
    FileStorageModule,
    // forwardRef(() => TracksModule),
    ConfigModule.forRoot(),
    //HttpAxios Module
    HttpModule.register({
      // Set response type for files get
      responseType: 'arraybuffer',
      responseEncoding: 'binary',
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
  ],
  controllers: [ChatController],
  providers: [UsersService, ChatService, GeneralExceptionFilter, KazmService],
  exports: [UsersService, ChatService, GeneralExceptionFilter],
})
export class ChatModule implements OnModuleInit, OnModuleDestroy {
  constructor() {
    return;
  }

  async onModuleInit() {
    return Logger.log('Chat Module initialized');
  }

  async onModuleDestroy() {
    return Logger.log('Chat Module destroyed');
  }
}
