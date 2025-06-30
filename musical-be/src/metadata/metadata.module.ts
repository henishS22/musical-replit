import { Logger, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { MetadataController } from './metadata.controller';
import { MetadataService } from './metadata.service';
import { SchemasModule } from '../schemas/schemas.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';

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
  controllers: [MetadataController],
  providers: [MetadataService],
})
export class MetadataModule implements OnModuleInit, OnModuleDestroy {
  constructor() {
    return;
  }

  async onModuleInit() {
    return Logger.log('MetadataModule module initialized');
  }

  async onModuleDestroy() {
    return Logger.log('MetadataModule module destroyed');
  }
}
