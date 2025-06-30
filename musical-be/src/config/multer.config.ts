import { Logger } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import * as path from 'path';

export const multerOPtions: MulterOptions = {
  storage: diskStorage({
    destination: './src/uploads',
    filename: (req, file, cb) => {
      try {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);
        const fileName = `${path.basename(
          file.originalname,
          extension,
        )}-${uniqueSuffix}${extension}`;
        cb(null, fileName);
      } catch (err) {
        Logger.error('Error in Multer: ', err);
      }
    },
  }),
};
