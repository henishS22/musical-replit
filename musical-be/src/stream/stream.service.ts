import ServiceException from './exceptions/serviceException';
import { ExceptionsEnum } from './utils/enums';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LiveStream } from '../schemas/schemas/stream.schema';
import { CreateLiveStreamDto, LiveStreamType } from './dto/create-stream.dto';
import { StreamClient } from "@stream-io/node-sdk";
import { Storage } from '@google-cloud/storage';
import { AccessControl } from './dto/create-stream.dto';
import { NotifiesService } from '../notifies/notifies.service';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { UpdateLiveStreamDto } from './dto/update-stream.dto';
import { Checkout, UserFile, UserFileDocument } from '../schemas/schemas';
import { FileStorageService } from '../file-storage/fileStorage.service';
import { StorageType } from '../schemas/utils/enums';
import { ObjectId } from 'mongodb';
import { UserActivityService } from '../user-activity/user-activity.service';
import { EventTypeEnum } from '../gamificationEvent/utils/enum';

@Injectable()
export class LiveStreamService {
  private client: StreamClient;
  private streamApiKey: string;
  private streamSecret: string;

  private bucketName = this.configService.get<string>('PUBLIC_BUCKET');

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(LiveStream.name) private liveStreamModel: Model<LiveStream>,
    @Inject('GCS_STORAGE') private readonly storage: Storage,
    @InjectModel(Checkout.name) private checkoutModel: Model<Checkout>,
    @InjectModel(UserFile.name) private userFileModel: Model<UserFileDocument>,
    private readonly notificationsService: NotifiesService,
    private readonly fileStorageService: FileStorageService,
    private readonly userActivityService: UserActivityService

  ) {
    this.streamApiKey = this.configService.get<string>('PUBLIC_KEY_GETSTREAM');
    this.streamSecret = this.configService.get<string>('PRIVATE_KEY_GETSTREAM');

    this.client = new StreamClient(this.streamApiKey, this.streamSecret);
  }

  async uploadArtwork(userId: string, streamId: string, file: Express.Multer.File) {
    const bucket = this.storage.bucket(this.bucketName);
    const fileName = `${streamId}_artwork`
    const fileUpload = bucket.file(fileName);
    try {
      await fileUpload.save(file.buffer, { contentType: file.mimetype });
      // update user storage usage
      const [metadata] = await fileUpload.getMetadata()
      await this.fileStorageService.updateStorageUsage(userId, metadata.size, StorageType.GC)
      const userFileData = {
        userId,
        fileName,
        bucket: this.bucketName,
        fileSize: metadata.size,
        file: 'artwork',
        fileFor: 'stream',
        stream_id: streamId
      }
      await this.userFileModel.create(userFileData)
      return `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
    } catch (error) {
      throw `Error uploading file: ${error}`;
    }
  }

  async createUser(userId: string, name: string) {
    try {
      const newUser = {
        id: userId,
        role: 'user',
        name: name,
      };
      return await this.client.upsertUsers([newUser]);
    } catch (error) {
      throw new ServiceException(
        'Error' + JSON.stringify(error),
        ExceptionsEnum.InternalServerError,
      );
    }
  }

  async generateUserToken(userId: string) {
    try {
      // validity is optional, in this case we set it to 1 day
      const validity = 24 * 60 * 60;
      return await this.client.generateUserToken({ user_id: userId, validity_in_seconds: validity });
    } catch (error) {
      throw new ServiceException(
        'Error' + JSON.stringify(error),
        ExceptionsEnum.InternalServerError,
      );
    }
  }

  async generateCallToken(owner: string, callTokenDto: { cids: string[] }) {
    try {
      const { cids } = callTokenDto;
      const token = await this.client.generateCallToken({ user_id: owner, call_cids: cids, role: 'user' });
      return token;
    } catch (error) {
      throw new ServiceException(
        'Error' + JSON.stringify(error),
        ExceptionsEnum.InternalServerError,
      );
    }

  }

  async getCallTypes() {
    try {
      return await this.client.video.listCallTypes();
    } catch (error) {
      throw new ServiceException(
        'Error' + JSON.stringify(error),
        ExceptionsEnum.InternalServerError,
      );
    }
  }

  async scheduleStream(
    createdById: string,
    createLiveStreamDto: CreateLiveStreamDto,
    artwork?: Express.Multer.File
  ) {
    try {
      const streamId: string = await uuidv4();
      const _id = new ObjectId()
      let artworkUrl = null;
      if (artwork) {
        artworkUrl = await this.uploadArtwork(createdById, _id.toString(), artwork);
      }

      const liveStream = new this.liveStreamModel({
        _id,
        ...createLiveStreamDto,
        createdById,
        artworkUrl,
        streamId,
      });
      await liveStream.save();

      const liveStreamId = liveStream?._id.toString()
      const fromUserId = liveStream?.createdById.toString()
      const tokenIds = liveStream?.nftIds
      const scheduleDate = liveStream?.scheduleDate;

      // Get UTC components
      const day = String(scheduleDate.getUTCDate()).padStart(2, '0');
      const month = String(scheduleDate.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-based
      const year = scheduleDate.getUTCFullYear();

      const hours = String(scheduleDate.getUTCHours()).padStart(2, '0');
      const minutes = String(scheduleDate.getUTCMinutes()).padStart(2, '0');
      const seconds = String(scheduleDate.getUTCSeconds()).padStart(2, '0');

      const formattedUTC = `${day}-${month}-${year}, ${hours}:${minutes}:${seconds}`;

      //notification for public
      if (liveStream?.accessControl === "public") {
        await this.notificationsService.publicStream(
          liveStreamId,
          fromUserId,
          scheduleDate,
          formattedUTC
        );
      }

      //notification for private
      if (liveStream?.accessControl === "private") {
        await this.notificationsService.privateStream(
          liveStreamId,
          fromUserId,
          tokenIds,
          scheduleDate,
          formattedUTC
        );
      }

      //gamification token assign for START_LIVESTREAM_FOR_FANS
      if (createLiveStreamDto.type !== LiveStreamType.AUDIO_ROOM) {
        await this.userActivityService.activity(createdById, EventTypeEnum.START_LIVESTREAM_FOR_FANS)
      }

      //gamification token assign for START_AUDIO_ROOM_FOR_FANS
      if (createLiveStreamDto.type === LiveStreamType.AUDIO_ROOM) {
        await this.userActivityService.activity(createdById, EventTypeEnum.START_AUDIO_ROOM_FOR_FANS)
      }

      return liveStream;
    } catch (error) {
      throw new ServiceException(
        'Error' + JSON.stringify(error),
        ExceptionsEnum.InternalServerError,
      );
    }
  }

  async updateStream(streamId: string, updateLiveStreamDto: UpdateLiveStreamDto): Promise<any | null> {
    try {
      const livestream = await this.liveStreamModel.findOneAndUpdate({ streamId })
      if (!livestream) {
        throw new ServiceException(
          'Live stream not found',
          ExceptionsEnum.NotFound,
        );
      }
      if (livestream.status === 'live' || livestream.status === 'completed') {
        throw new ServiceException(
          'Cannot update a live or completed stream',
          ExceptionsEnum.BadRequest,
        );
      }

      const liveStream = await this.liveStreamModel.updateOne(
        { streamId },
        updateLiveStreamDto,
        { new: true },
      );
      return liveStream;
    } catch (error) {
      throw new ServiceException(
        'Error' + JSON.stringify(error),
        ExceptionsEnum.InternalServerError,
      );
    }

  }

  async updateStreamStatus(streamId: string, status: string): Promise<any | null> {
    const livestream = await this.liveStreamModel.findOne({ streamId })
    if (!livestream) {
      throw new ServiceException(
        'Live stream not found',
        ExceptionsEnum.NotFound,
      );
    }
    const updatedStream = await this.liveStreamModel.updateOne({ streamId }, { status: status, isEverLive: true }, { new: true });
    return updatedStream;
  }

  async getUserHostedStreams(owner: string) {
    try {
      return await this.liveStreamModel.find({ createdById: owner, status: { $ne: 'completed' } }).populate('createdById', 'name username profile_img');
    } catch (error) {
      throw new ServiceException(
        'Error' + JSON.stringify(error),
        ExceptionsEnum.InternalServerError,
      );
    }
  }

  async getPublicStreams(owner: string) {
    try {
      return await this.liveStreamModel.find({ accessControl: AccessControl.PUBLIC, createdById: { $ne: owner }, status: { $ne: 'completed' } }).populate('createdById', 'name username profile_img');;
    } catch (error) {
      throw new ServiceException(
        'Error' + JSON.stringify(error),
        ExceptionsEnum.InternalServerError,
      );
    }
  }

  async getStreamDetails(streamId: string) {
    try {
      return await this.liveStreamModel.findOne({ streamId });
    } catch (error) {
      throw new ServiceException(
        'Error' + JSON.stringify(error),
        ExceptionsEnum.InternalServerError,
      );
    }
  }

  async getNftHolders(streamId: string) {
    try {
      const stream = await this.liveStreamModel.findOne({ streamId });
      if (!stream) {
        throw new ServiceException('Stream not found', ExceptionsEnum.BadRequest);
      }

      if (stream?.accessControl !== AccessControl.PRIVATE) {
        throw new ServiceException('Stream is not private, can not fetch nft holders', ExceptionsEnum.BadRequest);
      }

      const streamNftIds = stream.nftIds;
      if (!streamNftIds || streamNftIds.length === 0) {
        throw new Error(
          'No NFTs associated with this stream'
        );
      }

      // Aggregate to find unique user IDs based on buyer (addr) in wallet
      const uniqueUserIds = await this.checkoutModel.aggregate([
        { $match: { nft: { $in: streamNftIds } } }, // Match NFT IDs
        {
          $lookup: {
            from: 'users',
            localField: 'buyer',
            foreignField: 'wallets.addr',
            as: 'userDetails',
          },
        },
        { $unwind: '$userDetails' },
        { $group: { _id: '$userDetails._id' } },
        { $project: { _id: 0, userId: '$_id' } },
      ]);

      return uniqueUserIds.map(user => user.userId);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async statusUpdateExpireStreams() {
    try {
      const currentDate = new Date();
      const expiredStreams = await this.liveStreamModel.find({
        status: "scheduled",
        scheduleDate: { $lt: currentDate }
      });
      if (expiredStreams.length > 0) {
        await this.liveStreamModel.updateMany(
          { status: "scheduled", scheduleDate: { $lt: currentDate } },
          { $set: { status: "completed", isEverLive: false } }
        );
      }

    } catch (err) {
      console.log('Error while deleting media for schedule posts: ', err.message)
    }
  }
}