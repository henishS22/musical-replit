import {
  Module,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  Inject,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FileStorageService } from './fileStorage.service';
import { Storage } from '@google-cloud/storage';
import { SchemasModule } from '../schemas/schemas.module';

export const storageProvider = {
  provide: 'GCS_STORAGE',
  useFactory: () => {
    return new Storage({
      keyFilename: 'gcs.json',
    });
  },
};

const configureCorsProvider = {
  provide: 'CORS_CONFIGURATION',
  useFactory: (configService: ConfigService, storage: Storage) => {
    return async () => {
      const logger = new Logger('CORSConfiguration');
      const imageBucket = configService.get<string>('IMAGE_BUCKET');

      try {
        logger.log('Configuring CORS');
        await storage.bucket(imageBucket).setCorsConfiguration([
          {
            origin: [
              'http://localhost:3000',
              'https://musical.visionnaire.com.br',
              'https://www.musicalapp.com/',
              process.env.FRONTEND_URL,
            ],
            method: ['GET', '*'],
            responseHeader: ['image/jpeg', '*'],
          },
        ]);
        logger.log('CORS configured successfully');
      } catch (e) {
        logger.error('Error in CORS configuration', e);
      }
    };
  },
  inject: [ConfigService, 'GCS_STORAGE'],
};

@Module({
  imports: [
    // Load environment data
    ConfigModule.forRoot(),
    SchemasModule
  ],
  providers: [storageProvider, configureCorsProvider, FileStorageService],
  exports: [FileStorageService, 'GCS_STORAGE', 'CORS_CONFIGURATION', FileStorageModule],
})
export class FileStorageModule implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject('CORS_CONFIGURATION')
    private readonly configureCors: () => Promise<void>,
  ) { }

  /**
   * Initializes the module and runs the CORS configuration.
   */
  async onModuleInit() {
    Logger.log('File Storage Module initializing...');
    await this.configureCors();
    Logger.log('File Storage Module initialized');
  }

  /**
   * Defines the on module destroy function to close connections.
   */
  async onModuleDestroy() {
    console.log('File Storage Module destroyed');
  }
}
