import { Logger, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DistroController } from './distro.controller';
import { DistroService } from './distro.service';
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
  controllers: [DistroController],
  providers: [DistroService],
})
export class DistroModule implements OnModuleInit, OnModuleDestroy {
  constructor() {
    return;
  }

  async onModuleInit() {
    return Logger.log('Distro module initialized');
  }

  async onModuleDestroy() {
    return Logger.log('Distro module destroyed');
  }
}
