import { Logger, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { KazmController } from './kazm.controller';
import { KazmService } from './kazm.service';
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
  controllers: [KazmController],
  providers: [KazmService],
})
export class KazmModule implements OnModuleInit, OnModuleDestroy {
  constructor() {
    return;
  }

  async onModuleInit() {
    return Logger.log('Kazm module initialized');
  }

  async onModuleDestroy() {
    return Logger.log('Kazm module destroyed');
  }
}
