import { Logger, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { SchemasModule } from '../schemas/schemas.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestController } from './quest.controller';
import { QuestService } from './quest.service';
import { NotifiesModule } from '../notifies/notifies.module';

@Module({
  imports: [
    SchemasModule,
    NotifiesModule,
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
  controllers: [QuestController],
  providers: [QuestService],
  exports: [QuestService],
})
export class QuestModule implements OnModuleInit, OnModuleDestroy {
  constructor() {
    return;
  }

  async onModuleInit() {
    return Logger.log('Quest module initialized');
  }

  async onModuleDestroy() {
    return Logger.log('Quest module destroyed');
  }
}
