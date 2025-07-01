import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LiveStreamService } from './stream.service';
import { LiveStreamController } from './stream.controller';
import { SchemasModule } from '../schemas/schemas.module';
import { FileStorageModule } from '../file-storage/fileStorage.module';
import { NotifiesModule } from '../notifies/notifies.module';
import { FileStorageService } from '../file-storage/fileStorage.service';
import { Storage } from '@google-cloud/storage';
import * as multer from 'multer';
import {
  DEFAULT_IMAGE_FILE_SIZE_LIMIT,
  ALLOWED_IMAGE_MIMETYPES,
  ALLOWED_PROJECT_MIMETYPES,
} from './utils/consts';
import { UserActivityService } from '../user-activity/user-activity.service';

export const storageProvider = {
  provide: 'GCS_STORAGE',
  useFactory: () => {
    return new Storage({
      keyFilename: 'gcs.json',
    });
  },
};

@Module({
  imports: [SchemasModule, ConfigModule.forRoot(), FileStorageModule, NotifiesModule],
  providers: [LiveStreamService, FileStorageService, storageProvider, UserActivityService],
  controllers: [LiveStreamController],
})
export class StreamModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        multer(
          // {
          //   limits: {
          //     fileSize: DEFAULT_IMAGE_FILE_SIZE_LIMIT,
          //   },
          //   fileFilter: (req, file, cb) => {
          //     if (!file) {
          //       return cb(null, false);
          //     }
          //     if (
          //       !ALLOWED_IMAGE_MIMETYPES.includes(file.mimetype) &&
          //       !ALLOWED_PROJECT_MIMETYPES.includes(file.mimetype)
          //     ) {
          //       cb(null, false);
          //       Logger.error('Invalid file type');
          //       return;
          //     }
          //     cb(null, true);
          //   },
          // }
        ).fields([
          { name: 'artwork', maxCount: 1 },
        ]),
      )
      .forRoutes(LiveStreamController);
  }
}
