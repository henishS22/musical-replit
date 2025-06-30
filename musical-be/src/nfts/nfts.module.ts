/**
 *  @file App main module file. Defines the module settings, like schemas, db connections and more.
 *  @author Rafael Marques Siqueira
 *  @exports AppModule
 */

import { Module, OnModuleInit, OnModuleDestroy, Logger, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NftsController } from './nfts.controller';
import { NftsService } from './nfts.service';
import { MongooseModule } from '@nestjs/mongoose';
import { GeneralExceptionFilter } from './filters/generalException.filter';
import { SchemasModule } from '../schemas/schemas.module';
import { FileStorageModule } from '../file-storage/fileStorage.module';
import { FileStorageService } from '../file-storage/fileStorage.service';
import { ProjectsModule } from '../projects/projects.module';
import { ProjectTracksService } from '../projects/services/projectTracks.service';
import { UserActivityService } from '../user-activity/user-activity.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SchemasModule,
    forwardRef(() => ProjectsModule),
    FileStorageModule,
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
  controllers: [NftsController],
  providers: [NftsService, GeneralExceptionFilter, FileStorageService, ProjectTracksService, UserActivityService],
  exports: [NftsService, UserActivityService],
})
export class NftsModule implements OnModuleInit, OnModuleDestroy {
  //Define the microservice to connect
  constructor() {
    return;
  }
  /**
   * Defines the on moudule init function to subscribe to reply topics
   * @function
   */
  async onModuleInit() {
    return Logger.log('NFTS Module initialized');
  }

  /**
   * Defines the on moudule destroy function to close connection
   * @function
   */
  async onModuleDestroy() {
    await Logger.log('NFTS Module destroyed');
  }
}
