import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';
import { GetSignedUrlConfig, Storage } from '@google-cloud/storage';
import ServiceException from './exceptions/ServiceException';
import { GetUrlDto, FileDeleteDto, FileUploadDto } from './dto';
import fetch from 'node-fetch';
import Jimp = require('jimp');
import sharp = require('sharp');
import { ExceptionsEnum } from './utils/enums';
import { UserFile, UserFileDocument, UserStorage, UserStorageDocument, UserSubscription, UserSubscriptionDocument, UserSubscriptionStatus } from '../schemas/schemas';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StorageType } from '../schemas/utils/enums';
import { FileUploadDTO } from '../tracks/dto/fileUpload.dto';
//  import { Types } from 'mongoose';
import * as mongoose from 'mongoose';

const DEFAULT_IMAGE_TRANS_FILE_REDIS_CACHE_TTL = 60;

export class StorageLimitExceededException extends HttpException {
  constructor(totalUsage: number, totalLimit: number) {
    const message = `You have exceeded the storage limit across all your subscription plans. Please upgrade your plan or delete the files to access platform.`;

    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        errorCode: 'FEATURE_LIMIT_EXCEEDED_STORAGE',
        message,
        data: {
          totalUsage: `${totalUsage} GB`,
          totalLimit: `${totalLimit} GB`,
        },
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

@Injectable()
export class FileStorageService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRedis() private readonly redis: Redis,
    @Inject('GCS_STORAGE') private readonly storage: Storage,
    @InjectModel(UserStorage.name) private readonly userStorageModel: Model<UserStorageDocument>,
    @InjectModel(UserSubscription.name) private readonly userSubscriptionModel: Model<UserSubscriptionDocument>,
    @InjectModel(UserFile.name) private readonly userFileModel: Model<UserFileDocument>
  ) { }

  //Audio functions
  /**
   * Define the function to upload a new audio to the bucket
   * @function
   * @param {FileUploadDto} fileUploadDto - The audio file to upload
   * @returns {Observable<T>} - Returns a observable of type T
   */
  async uploadAudio(userId: string, fileUploadDto: FileUploadDto, storageMetadata: any): Promise<any> {
    //Check for the mime type for audio files
    let extension;

    //Get the audio file from redis cache
    let cacheFileBuffer = null;
    try {
      cacheFileBuffer = await this.redis.getBuffer(fileUploadDto.fileCacheKey);
    } catch (error) {
      throw new ServiceException(
        'Error getting file from cache',
        ExceptionsEnum.InternalServerError,
      );
    }

    if (!cacheFileBuffer) {
      throw new ServiceException(
        'Error getting file from cache',
        ExceptionsEnum.InternalServerError,
      );
    }

    //Delete key from redis cache
    this.redis.del(fileUploadDto.fileCacheKey);

    //Get extension name
    switch (fileUploadDto.mimetype) {
      case 'audio/wave':
      case 'audio/wav':
      case 'audio/x-wav':
        extension = 'wav';
        break;
      case 'audio/mpeg':
      case 'audio/mpeg3':
      case 'audio/x-mpeg-3':
        extension = 'mp3';
        break;
      case 'audio/mp4':
      case 'audio/m4a':
      case 'audio/x-m4a':
        extension = 'm4a';
        break;
      case 'video/mp4':
        extension = 'mp4';
        break;
      case 'video/quicktime':
        extension = 'quicktime';
        break;
      case 'video/x-msvideo':
        extension = 'avi';
        break;
      case 'application/zip':
        extension = 'zip';
        break;
      case 'application/octet-stream':
        extension = 'ptx';
        break;
    }

    if (!extension) {
      throw new ServiceException(
        'Invalid file type',
        ExceptionsEnum.UnprocessableEntity,
      );
    }
    //Check for the max size limit
    if (
      fileUploadDto.size >
      this.configService.get<number>('AUDIO_FILE_SIZE_LIMIT')
    ) {
      throw new ServiceException(
        'File is too large',
        ExceptionsEnum.UnprocessableEntity,
      );
    }

    const bucketName = this.configService.get<string>('AUDIO_BUCKET')

    const myBucket = this.storage.bucket(
      this.configService.get<string>('AUDIO_BUCKET'),
    );

    const myFile = myBucket.file(fileUploadDto.id + '.' + extension);
    const contents = Buffer.from(cacheFileBuffer);

    const response = myFile
      .save(contents, { metadata: { contentType: fileUploadDto.mimetype } })
      .then(async () => {
        // update user storage usage
        await this.updateStorageUsage(userId, fileUploadDto.size, StorageType.GC)
        const userFileData = {
          userId,
          fileName: fileUploadDto.id + '.' + extension,
          bucket: bucketName,
          fileSize: fileUploadDto.size,
          file: storageMetadata.file,
          fileFor: storageMetadata.fileFor
        }
        if (storageMetadata.fileFor === 'track') userFileData['track_id'] = storageMetadata.track_id
        else if (storageMetadata.fileFor === 'project') userFileData['project_id'] = storageMetadata.project_id
        else if (storageMetadata.fileFor === 'collab') userFileData['collab_id'] = storageMetadata.collab_id
        else if (storageMetadata.fileFor === 'stream') userFileData['stream_id'] = storageMetadata.stream_id
        else if (storageMetadata.fileFor === 'user') userFileData['user_id'] = storageMetadata.user_id
        await this.userFileModel.create(userFileData)

        return 'File uploaded';
      })
      .catch((err) => {

        throw new ServiceException(
          `Error uploading file: ${err}`,
          ExceptionsEnum.InternalServerError,
        );
      });

    return response;
  }

  /**
   * Define the function to get the signed url for an audio file
   * @function
   * @param {string|string[]} name - The name or array of names for the file to generate an url
   * @returns {Observable<T>} - Returns a observable of type T
   */
  async getAudioUrl(getUrlDto: GetUrlDto): Promise<any> {
    const myBucket = this.storage.bucket(
      this.configService.get<string>('AUDIO_BUCKET'),
    );

    //Transform in a array if not yet
    const namesArray = Array.isArray(getUrlDto.name)
      ? getUrlDto.name
      : [getUrlDto.name];

    const resultArray = [];

    for await (const name of namesArray) {
      const myFile = myBucket.file(name);

      //Check if the file exists
      const [fileExists] = await myFile.exists();

      if (!fileExists) {
        resultArray.push(null);
      }

      const options: GetSignedUrlConfig = {
        version: 'v4',
        action: 'read',
        expires:
          Date.now() +
          1000 *
          parseInt(
            this.configService.get<string>('AUDIO_URL_EXPIRATION_TIME'),
          ) *
          60,
      };

      // Get a v2 signed URL for the file
      const audioUrl = await myFile.getSignedUrl(options);

      if (audioUrl && audioUrl[0]) {
        resultArray.push(audioUrl[0]);
      } else {
        resultArray.push(null);
      }
    }

    return resultArray;
  }

  /**
   * Define the function to download the signed url for an audio file
   * @function
   * @returns {Observable<T>} - Returns a observable of type T
   */
  async downloadAudioUrl(downalodUrlDto: { name: string }): Promise<any> {
    const myBucket = this.storage.bucket(
      this.configService.get<string>('AUDIO_BUCKET'),
    );

    //Transform in a array if not yet
    const namesArray = Array.isArray(downalodUrlDto.name)
      ? downalodUrlDto.name
      : [downalodUrlDto.name];

    for await (const name of namesArray) {
      const myFile = myBucket.file(name);

      //Check if the file exists
      const [fileExists] = await myFile.exists();

      if (!fileExists) {
        return null;
      }

      const [buffer] = await myFile.download();

      const fileCacheKey = downalodUrlDto.name + Date.now().toString();

      //Save to the redis
      try {
        await this.redis.setBuffer(
          fileCacheKey,
          buffer,
          'EX',
          DEFAULT_IMAGE_TRANS_FILE_REDIS_CACHE_TTL,
        );

        return fileCacheKey;
      } catch (error) {
        throw new ServiceException(
          'Error saving file on cache',
          ExceptionsEnum.InternalServerError,
        );
      }
    }
  }

  /**
   * Define the function to remove an audio from the bucket
   * @function
   * @param {FileDeleteDto} fileDeleteDto - The name for the file to delete
   * @returns {Observable<T>} - Returns a observable of type T
   */
  async deleteAudio(userId: string, fileDeleteDto: FileDeleteDto): Promise<any> {
    const myBucket = this.storage.bucket(
      this.configService.get<string>('AUDIO_BUCKET'),
    );
    const myFile = myBucket.file(fileDeleteDto.name);

    //Check if the file exists
    const [fileExists] = await myFile.exists();

    if (!fileExists) {
      throw new ServiceException(
        'File does not exist',
        ExceptionsEnum.NotFound,
      );
    }
    const [metadata] = await myFile.getMetadata()
    const fileSize = metadata.size

    const response = myFile
      .delete()
      .then(async () => {
        if (userId && userId !== null && userId !== '' && userId !== undefined && fileSize > 0) {
          await this.updateStorageUsage(userId, -fileSize, StorageType.GC)
          await this.userFileModel.deleteOne({ fileName: fileDeleteDto.name })
        }
        return 'File deleted';
      })
      .catch((err) => {
        throw new ServiceException(
          `Error deleting file: ${err}`,
          ExceptionsEnum.InternalServerError,
        );
      });

    return response;
  }

  /**
   * Define the function to transfer tracks to public bucket
   * @function
   * @returns {Observable<T>} - Returns a observable of type T
   */
  async copyAudioToPublic(tracks: [string]): Promise<any> {
    const myAudioBucket = this.storage.bucket(
      this.configService.get<string>('AUDIO_BUCKET'),
    );

    const myPublicBucket = this.storage.bucket(
      this.configService.get<string>('PUBLIC_BUCKET'),
    );

    const urls = [];

    for await (const trackName of tracks) {
      const myFile = myAudioBucket.file(trackName);
      const myPublicFile = myPublicBucket.file(trackName);

      //Check if the files exists
      const [fileExists] = await myFile.exists();
      const [publicFileExists] = await myPublicFile.exists();

      if (!fileExists) {
        throw new ServiceException(
          'File does not exist',
          ExceptionsEnum.NotFound,
        );
      }

      //Check if the file already exist in the public storage, if true do nothing
      if (!publicFileExists) {
        // Send file to public bucket
        try {
          await myFile.copy(myPublicBucket.file(trackName));
        } catch (error) {
          throw new ServiceException(
            'Error coping file',
            ExceptionsEnum.InternalServerError,
          );
        }
      }

      urls.push(
        `https://storage.googleapis.com/${this.configService.get<string>(
          'PUBLIC_BUCKET',
        )}/${trackName}`,
      );
    }

    return urls;
  }

  //Image functions
  /**
   * Define the function to upload a new image to the bucket
   * @function
   * @param {FileUploadDto} fileUploadDto - The image file to upload
   * @returns {Observable<T>} - Returns a observable of type T
   */
  async uploadImage(userId: string, fileUploadDto: FileUploadDto, storageMetadata: any): Promise<any> {
    //Check for the mime type for bmp, jpeg or png
    let extension;

    //Get the image file from redis cache
    let cacheFileBuffer = null;
    try {
      cacheFileBuffer = await this.redis.getBuffer(fileUploadDto.fileCacheKey);
    } catch (error) {
      throw new ServiceException(
        'Error getting file from cache',
        ExceptionsEnum.InternalServerError,
      );
    }

    if (!cacheFileBuffer) {
      throw new ServiceException(
        'Error getting file from cache',
        ExceptionsEnum.InternalServerError,
      );
    }

    //Delete key from redis cache
    this.redis.del(fileUploadDto.fileCacheKey);

    //Get extension name
    switch (fileUploadDto.mimetype) {
      case 'image/bmp':
        extension = 'bmp';
        break;
      case 'image/jpeg':
        extension = 'jpeg';
        break;
      case 'image/png':
        extension = 'png';
        break;
    }

    if (!extension) {
      throw new ServiceException(
        'Invalid file type',
        ExceptionsEnum.UnprocessableEntity,
      );
    }
    //Check for the max size limit
    if (
      fileUploadDto.size >
      this.configService.get<number>('IMAGE_FILE_SIZE_LIMIT')
    ) {
      throw new ServiceException(
        'File is too large',
        ExceptionsEnum.UnprocessableEntity,
      );
    }

    const bucketName = fileUploadDto.isPublic
      ? this.configService.get<string>('PUBLIC_BUCKET')
      : this.configService.get<string>('IMAGE_BUCKET')
    const myBucket = this.storage.bucket(
      fileUploadDto.isPublic
        ? this.configService.get<string>('PUBLIC_BUCKET')
        : this.configService.get<string>('IMAGE_BUCKET'),
    );

    const contents = Buffer.from(cacheFileBuffer);
    let processedContents;

    //Apply conversion and compression to the images
    switch (extension) {
      case 'jpeg':
        processedContents = await sharp(contents)
          .jpeg({
            quality: 85,
            chromaSubsampling: '4:4:4',
            mozjpeg: true,
          })
          .toBuffer();
        break;
      case 'png':
        processedContents = await sharp(contents)
          .png({ palette: true, compressionLevel: 8, quality: 80 })
          .toBuffer();
        break;
      case 'bmp':
        //Read the BMP buffer with jimp
        const jimpBmpImage = await Jimp.read(contents);

        if (jimpBmpImage) {
          //Get png buffer from bmp image
          const newPngBuffer = await jimpBmpImage.getBufferAsync(Jimp.MIME_PNG);

          if (newPngBuffer && Buffer.isBuffer(newPngBuffer)) {
            processedContents = await sharp(newPngBuffer)
              .png({ compressionLevel: 8, quality: 80 })
              .toBuffer();
          }
        }
        break;
    }

    // const fileName = fileUploadDto.id + '.' + extension;
    const fileName = fileUploadDto.id
    const myFile = myBucket.file(fileName);

    //Check if the file exists
    let [fileExists] = await myFile.exists();
    let fileSize = 0;
    if (fileExists) {
      const [metadata] = await myFile.getMetadata()
      fileSize = metadata.size
    }

    const response = myFile
      .save(processedContents || contents, {
        metadata: { contentType: fileUploadDto.mimetype, cacheControl: 'no-cache, no-store, must-revalidate' },
      })
      .then(async () => {
        // update user storage usage
        if (userId && userId !== null && userId !== '' && userId !== undefined) {
          const [metadata] = await myFile.getMetadata()
          if (fileExists) {
            const actualSize = metadata.size - fileSize
            await this.updateStorageUsage(userId, actualSize, StorageType.GC)
            await this.userFileModel.updateOne({ fileName: fileName }, { fileSize: metadata.size })
          } else {
            await this.updateStorageUsage(userId, metadata.size, StorageType.GC)
            const userFileData = {
              userId,
              fileName,
              bucket: bucketName,
              fileSize: metadata.size,
              file: storageMetadata.file,
              fileFor: storageMetadata.fileFor
            }
            if (storageMetadata.fileFor === 'track') userFileData['track_id'] = storageMetadata.track_id
            else if (storageMetadata.fileFor === 'project') userFileData['project_id'] = storageMetadata.project_id
            else if (storageMetadata.fileFor === 'collab') userFileData['collab_id'] = storageMetadata.collab_id
            else if (storageMetadata.fileFor === 'stream') userFileData['stream_id'] = storageMetadata.stream_id
            else if (storageMetadata.fileFor === 'user') userFileData['user_id'] = storageMetadata.user_id
            await this.userFileModel.create(userFileData)
          }
        }
        if (!fileUploadDto.isPublic) {
          return 'File uploaded';
        }

        return `https://storage.googleapis.com/${this.configService.get<string>(
          'PUBLIC_BUCKET',
        )}/${fileName}`;
      })
      .catch((err) => {
        throw `Error uploading file: ${err}`;
      });

    return response;
  }

  async transferImage({
    url,
    name,
  }: {
    url: string;
    name: string;
  }): Promise<any> {
    if (url == null) {
      return null;
    }

    const blob: any = await fetch(url).then((r) => r.blob());

    const fileBuffer = Buffer.from(await blob.arrayBuffer());

    const fileCacheKey =
      name.trim().replace(/\s/g, '') + '_image_no_owner_' + Date.now();

    //Save to the redis
    try {
      await this.redis.setBuffer(
        fileCacheKey,
        fileBuffer,
        'EX',
        DEFAULT_IMAGE_TRANS_FILE_REDIS_CACHE_TTL,
      );
    } catch (error) {
      throw new ServiceException(
        'Error saving file on cache',
        ExceptionsEnum.InternalServerError,
      );
    }

    const res = await this.uploadImage(null, {
      id: name,
      fileCacheKey,
      isPublic: true,
      mimetype: blob.type,
      size: blob.size,
    }, {});

    return res;
  }

  /**
   * Define the function to get a sign url for an image file
   * @function
   * @param {string} name - The name for the file to generate an url
   * @returns {Observable<T>} - Returns a observable of type T
   */
  async getImageUrl(getUrlDto: GetUrlDto): Promise<string[]> {
    const myBucket = this.storage.bucket(
      this.configService.get<string>('IMAGE_BUCKET'),
    );

    //Transform in a array if not yet
    const namesArray = Array.isArray(getUrlDto.name)
      ? getUrlDto.name
      : [getUrlDto.name];

    const resultArray = [];

    for await (const name of namesArray) {
      const myFile = myBucket.file(name);

      //Check if the file exists
      const [fileExists] = await myFile.exists();

      if (!fileExists) {
        resultArray.push(null);
        continue;
      }

      const defaultMinutesToExpiry = parseInt(
        this.configService.get<string>('IMAGE_URL_EXPIRATION_TIME'),
      );

      const minutesToExpiry = getUrlDto?.minutesToExpiry
        ? parseInt(String(getUrlDto?.minutesToExpiry || '0'))
        : defaultMinutesToExpiry;

      const options: GetSignedUrlConfig = {
        version: 'v4',
        action: 'read',
        expires: Date.now() + 1000 * minutesToExpiry * 60,
      };

      // Get a v2 signed URL for the file
      const imageUrl = await myFile.getSignedUrl(options);

      if (imageUrl && imageUrl[0]) {
        resultArray.push(imageUrl[0]);
      } else {
        resultArray.push(null);
      }
    }

    return resultArray;
  }

  /**
   * Define the function to remove an image from the bucket
   * @function
   * @param {FileDeleteDto} fileDeleteDto - The name for the file to delete
   * @returns {Observable<T>} - Returns a observable of type T
   */
  async deleteImage(userId: string, fileDeleteDto: FileDeleteDto): Promise<any> {
    const myBucket = this.storage.bucket(
      this.configService.get<string>('IMAGE_BUCKET'),
    );
    const myFile = myBucket.file(fileDeleteDto.name);
    const [metadata] = await myFile.getMetadata()
    const fileSize = metadata.size
    //Check if the file exists
    const [fileExists] = await myFile.exists();

    if (!fileExists) {
      throw new ServiceException(
        'File does not exist',
        ExceptionsEnum.NotFound,
      );
    }

    const response = await myFile
      .delete()
      .then(async () => {
        if (userId && userId !== null && userId !== '' && userId !== undefined && fileSize > 0) {
          await this.updateStorageUsage(userId, -fileSize, StorageType.GC)
          await this.userFileModel.deleteOne({ fileName: fileDeleteDto.name })
        }
        return 'File deleted';
      })
      .catch((err) => {
        throw `Error deleting file: ${err}`;
      });

    return response;
  }

  async deleteImageFromPublicBucket(userId: string, fileDeleteDto: any): Promise<any> {
    const myBucket = this.storage.bucket(
      fileDeleteDto.bucketName
    );
    const myFile = myBucket.file(fileDeleteDto.imageName);
    const [metadata] = await myFile.getMetadata()
    const fileSize = metadata.size
    //Check if the file exists
    const [fileExists] = await myFile.exists();

    if (!fileExists) {
      throw new ServiceException(
        'File does not exist',
        ExceptionsEnum.NotFound,
      );
    }

    const response = await myFile
      .delete()
      .then(async () => {
        if (userId && userId !== null && userId !== '' && userId !== undefined && fileSize > 0) {
          await this.updateStorageUsage(userId, -fileSize, StorageType.GC)
          await this.userFileModel.deleteOne({ fileName: fileDeleteDto.imageName })
        }
        return 'File deleted';
      })
      .catch((err) => {
        throw `Error deleting file: ${err}`;
      });

    return response;
  }

  /**
   * Updates the storage usage in both UserStorage and UserSubscription tables.
   * @param userId - The ID of the user whose storage is being updated.
   * @param fileSizeChange - The change in file size (positive for upload, negative for delete).
   * @param storageType - The type of storage being updated (e.g., 'basic', 'premium').
   * @returns The updated UserStorage and UserSubscriptions.
   */
  async updateStorageUsage(
    userId: string,
    fileSizeChange: number,
    storageType: string,
  ): Promise<{ userStorage: UserStorage; userSubscriptions: UserSubscription[] }> {
    try {
      // Fetch the user's storage record
      const userStorage = await this.userStorageModel.findOne({ userId });
      if (!userStorage) {
        throw new Error(`User storage record not found for userId: ${userId}`);
      }

      // Fetch all active subscriptions for the user
      const userSubscriptions = await this.userSubscriptionModel
        .find({
          userId,
          status: UserSubscriptionStatus.Active,
        })
        .populate<{ subscriptionId: any }>('subscriptionId'); // Populate subscription details

      if (!userSubscriptions || userSubscriptions.length === 0) {
        throw new Error('No active subscriptions found for the user.');
      }

      fileSizeChange = fileSizeChange / (1024 * 1024 * 1024);
      let remainingChange = fileSizeChange;

      // **Step 1: Update UserSubscription**
      if (fileSizeChange > 0) {
        // **UPLOAD**: Use older subscriptions first (sorted by startDate ascending)
        userSubscriptions.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      } else {
        // **DELETE**: Free up newer subscriptions first (sorted by startDate descending)
        userSubscriptions.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      }

      for (const userSub of userSubscriptions) {
        const storageFeature = userSub.subscriptionId.features.find(
          (feature) => feature.featureKey === 'storage',
        );
        if (!storageFeature || !storageFeature.limit) {
          continue; // Skip if the subscription does not have a storage feature or limit
        }

        const planLimit = Number(storageFeature.limit);
        // Access the current usage for the 'storage' feature
        const storageUsage = userSub.usage.find((usage) => usage.featureKey === 'storage');
        const currentUsage = storageUsage?.usage || 0;
        if (fileSizeChange > 0) {
          // **UPLOAD**: Increase usage
          const availableSpace = planLimit - Number(currentUsage);

          if (availableSpace > 0) {
            const usageToAdd: number = Math.min(remainingChange, availableSpace);
            if (storageUsage) {
              storageUsage.usage = Number(storageUsage.usage) + usageToAdd;
            } else {
              userSub.usage.push({ featureKey: 'storage', usage: usageToAdd });
            }
            remainingChange -= usageToAdd;
          }
        } else if (fileSizeChange < 0) {
          // **DELETE**: Decrease usage
          const usageToRemove = Math.min(Math.abs(remainingChange), Number(currentUsage));

          if (storageUsage) {
            storageUsage.usage = Number(storageUsage.usage) - usageToRemove;
          }

          remainingChange += usageToRemove;
        }

        // Use updateOne to persist changes to the database
        await this.userSubscriptionModel.updateOne(
          { _id: userSub._id }, // Match the subscription by its ID
          { $set: { usage: userSub.usage } }, // Update the usage field
        );

        // Break the loop if the remaining change is fully handled
        if (remainingChange === 0) {
          break;
        }
      }

      // If there's still remaining change after processing all subscriptions, throw an error
      if (remainingChange > 0) {
        throw new Error('Storage limit exceeded across all active subscriptions.');
      }

      // **Step 2: Update UserStorage**
      userStorage.totalStorageUsed += fileSizeChange;

      // Update the specific storage type
      const storageRecord = userStorage.storage.find((storage) => storage.storageType === storageType);
      if (storageRecord) {
        storageRecord.storageUsed += fileSizeChange;
      } else {
        throw new Error(`Storage type "${storageType}" not found for userId: ${userId}`);
      }

      // Save the updated UserStorage record
      await userStorage.save();

      return { userStorage, userSubscriptions };
    } catch (err) {
      console.log('Error in update storage usage: ', err.message)
    }
  }

  //get signed url from gcs
  async generateUploadUrl(fileDto: FileUploadDTO) {
    const { contentType, isLocal, extension } = fileDto
    const _id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId()
    const bucket = this.storage.bucket(this.configService.get<string>('AUDIO_BUCKET'));
    const file: any = bucket.file(`${_id}.${extension}`);

    if (isLocal) {
      const [uploadUrl]: any = await file.createResumableUpload({
        origin: 'http://localhost:3000',
        contentType,
      });
      return { _id, uploadUrl, gcsPath: file.name, };
    }

    const [uploadUrl]: any = await file.createResumableUpload({
      origin: process.env.FRONTEND_URL,
      contentType,
    });

    return {
      _id,
      uploadUrl,
      gcsPath: file.name,
    };
  }

  async deleteAudioFromGC(fileName: string): Promise<string> {
    const myBucket = this.storage.bucket(
      this.configService.get<string>('AUDIO_BUCKET'),
    );
    const myFile = myBucket.file(fileName);

    // Check if the file exists
    const [fileExists] = await myFile.exists();

    if (!fileExists) {
      return 'File does not exist.';
    }

    return myFile.delete()
      .then(() => {
        return 'File deleted';
      })
      .catch((err) => {
        throw new ServiceException(
          `Error deleting file: ${err.message || err}`,
          ExceptionsEnum.InternalServerError,
        );
      });
  }

}
