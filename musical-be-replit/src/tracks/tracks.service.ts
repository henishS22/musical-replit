import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpService } from '@nestjs/axios';
import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Redis } from 'ioredis';
import filetype from 'magic-bytes.js';
import { ObjectId } from 'mongodb';
import { Model, UpdateQuery, isValidObjectId } from 'mongoose';
import * as musicMetadata from 'music-metadata';
import { lastValueFrom } from 'rxjs';
import { createFolder } from './dto/createFolder.dto';
import { createTrack } from './dto/createTrack.dto';
import { updateTrack } from './dto/updateTrack.dto';
import ServiceException from './exceptions/ServiceException';
import {
  Collaboration,
  Project,
  TrackProject,
  Nft,
  Folder,
  Release,
  Tag,
  Track,
  TrackComment,
  Applications,
} from '@/src/schemas/schemas';
import { TrackLyricsService } from './services/trackLyrics.service';
import {
  DEFAULT_AUDIO_FILE_REDIS_CACHE_TTL,
  DEFAULT_LANG,
} from './utils/constants';
import { resourceDuplicatedError } from './utils/errors';
import { mimetypeToFileExtension } from './utils/functions';
import { ExceptionsEnum } from './utils/types';
import { appendFile } from 'fs';
import { file } from 'tmp';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ffprobe = require('ffprobe');
import { path } from 'ffprobe-static';
import { Application } from 'express';
import { VerifyTokenOwnershipDto } from './dto/verifyTokenOwnership.dto';
import { NftsService } from '../nfts/nfts.service';
import { ProjectsService } from '../projects/projects.service';
import { ProjectUpdateEnum } from '../utils/enums';
import { FileStorageService } from '../file-storage/fileStorage.service';
import { GetTracksFilterDto, SortOrder } from './dto/getTracksFilter.dto';
import { GetFolderContentDto } from './dto/getFolderContent';
import { IntiateCommentDto } from './dto/intiateComment.dto';
import { AddCommentDto } from './dto/addComment.dto';
import { DeleteCommentDto } from './dto/deleteComment.dto';
import { MarkAsResolveCommentDto } from './dto/markAsResolveComment.dto';
import { NotifiesService } from '../notifies/notifies.service';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import { EventTypeEnum } from '../gamificationEvent/utils/enum';
import { UserActivityService } from '../user-activity/user-activity.service';
import { StorageType } from '../schemas/utils/enums';

type ValidExtension = 'wav' | 'mp3' | 'mp4' | 'avi' | 'zip' | 'ptx' | 'm4a';

// Add type definitions for the file objects
interface FileObject {
  fileCacheKey: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

interface WaveformImage {
  buffer: Buffer;
  mimetype: string;
  size: number;
  fileCacheKey: string;
}

// Remove the extends if it causes conflicts
interface ImageFileType {
  buffer: Buffer;
  mimetype: string;
  size: number;
  fileCacheKey: string;
}

@Injectable()
export class TracksService {
  constructor(
    @InjectModel(Track.name) private trackModel: Model<Track>,
    @InjectModel(TrackComment.name)
    private trackCommentModel: Model<TrackComment>,
    @InjectModel(Nft.name) private nftModel: Model<Nft>,
    @InjectModel(Folder.name) private folderModel: Model<Folder>,
    @InjectModel(Project.name) private projects: Model<Project>,
    @InjectModel(Release.name) private releases: Model<Release>,
    @InjectModel(Applications.name) private applications: Model<Application>,
    @InjectModel(Collaboration.name)
    private collaborations: Model<Collaboration>,
    @InjectModel('tracks_projects')
    private trackProjectModel: Model<TrackProject>,
    private readonly trackLyricsService: TrackLyricsService,
    @InjectRedis() private readonly redis: Redis,
    private readonly httpService: HttpService,
    private readonly nftsService: NftsService,
    @Inject(forwardRef(() => ProjectsService))
    private readonly projectService: ProjectsService,
    private readonly fileStorageService: FileStorageService,
    private readonly notificationsService: NotifiesService,
    private readonly configService: ConfigService,
    private readonly userActivityService: UserActivityService,
  ) { }

  async createTrack({
    imageWaveSmall,
    imageWaveBig,
    artwork,
    ...track
  }: createTrack) {
    if (!track.file && !track.url) {
      throw new ServiceException(
        'File is not defined',
        ExceptionsEnum.UnprocessableEntity,
      );
    }

    const findDuplicated = await this.trackModel.findOne({
      user_id: track.user_id,
      folder_id: !track.folder_id ? null : new ObjectId(track.folder_id),
      name: track.name,
    });

    if (findDuplicated != null)
      throw new ServiceException(
        'Duplicated track found',
        ExceptionsEnum.Conflict,
      );

    if (track.folder_id) {
      const validateId = await this.folderModel.findById(track.folder_id);
      if (validateId == null)
        throw new ServiceException(
          'Folder id do not exist',
          ExceptionsEnum.UnprocessableEntity,
        );
    }

    let myMediaFile: {
      fileCacheKey: string;
      mimetype: string;
      buffer: Buffer;
      size: number;
    };

    if (track.file && track.file.fileCacheKey) {
      //Get the audio file from redis cache
      let cacheFileBuffer = null;
      try {
        cacheFileBuffer = await this.redis.getBuffer(track.file.fileCacheKey);
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

      myMediaFile = {
        fileCacheKey: track.file.fileCacheKey,
        mimetype: track.file.mimetype,
        buffer: cacheFileBuffer,
        size: track.file.size,
      };
    } else if (track.url) {
      let httpOptions = {};

      if (track.driveToken) {
        httpOptions = {
          headers: {
            Authorization: `Bearer ${track.driveToken}`,
          },
        };
      }

      //Load file from an URL
      const urlResponse: any = await lastValueFrom(
        this.httpService.get(track.url, httpOptions),
      );

      if (urlResponse.status != 200 || !urlResponse.data) {
        throw new ServiceException(
          'Error getting file from url',
          ExceptionsEnum.InternalServerError,
        );
      }

      const fileBuffer = urlResponse.data;

      //Get the file type from the audio
      const fileTypeInfo = await filetype(fileBuffer)[0];

      //Validate the type
      if (!fileTypeInfo) {
        throw new ServiceException(
          'Error getting file type info',
          ExceptionsEnum.InternalServerError,
        );
      }

      const mimetypeInfo = fileTypeInfo.mime;
      const extensionTypeInfo = track.extension;
      const allowedExtensions = [
        'wav',
        'mp3',
        'mp4a',
        'm4a',
        'mp4',
        'avi',
        'zip', // Garageband project
        'ptx',
        'mov', // Pro Tools
        'quicktime',
      ];
      //Validate extension
      if (!allowedExtensions.includes(extensionTypeInfo)) {
        throw new ServiceException(
          'Invalid file type',
          ExceptionsEnum.UnprocessableEntity,
        );
      }

      const bufferSize = fileBuffer.byteLength;
      const [fileType] = mimetypeInfo.split('/');

      //Add the file info to the redis
      const fileCacheKey = `${track.name
        .trim()
        .replace(/\s/g, '')}_${fileType}_url_${Date.now()}`;

      //Save to the redis
      // try {
      //   await this.redis.setBuffer(
      //     fileCacheKey,
      //     fileBuffer,
      //     'EX',
      //     DEFAULT_AUDIO_FILE_REDIS_CACHE_TTL,
      //   );
      // } catch (error) {
      //   throw new ServiceException(
      //     'Error saving file on cache',
      //     ExceptionsEnum.InternalServerError,
      //   );
      // }

      myMediaFile = {
        buffer: fileBuffer,
        fileCacheKey: fileCacheKey,
        mimetype: mimetypeInfo,
        size: bufferSize,
      };
    } else {
      throw new ServiceException(
        'Invalid create request',
        ExceptionsEnum.UnprocessableEntity,
      );
    }

    const invalidMimetypesForMetadata = [
      'application/zip',
      'application/octet-stream',
      // 'video/quicktime',
    ];
    const hasMusicMetadata = !invalidMimetypesForMetadata.includes(
      myMediaFile.mimetype,
    );

    //Get audio metadata info
    const myMetadata =
      hasMusicMetadata &&
      (await (async () => {
        try {
          if (
            myMediaFile.mimetype == 'video/mp4' ||
            myMediaFile.mimetype == 'video/quicktime'
          ) {
            const {
              streams: [videoMetaData, audioMetaData],
            } = await new Promise<any>((resolve, reject) =>
              file(async (err, dir, _fd, cleanup) => {
                if (err) reject(err);
                appendFile(
                  dir,
                  new DataView(myMediaFile.buffer.buffer) as any,
                  { flag: 'a' },
                  async function (err) {
                    if (err) reject(err);
                    ffprobe(dir, { path }, function (err, info) {
                      if (err) reject(err);
                      resolve(info);
                      cleanup();
                    });
                  },
                );
              }),
            );
            let sampleRate = audioMetaData?.sample_rate;
            let duration = videoMetaData?.duration;
            let channels = audioMetaData?.channels;
            let bitsPerSample = audioMetaData?.bits_per_sample;
            let bitrate = videoMetaData?.bit_rate;

            // fallback if missing metadata
            if (audioMetaData && !duration) {
              const convertedAudio = await this.convertToWav(myMediaFile.buffer);
              const fallbackMetadata = await musicMetadata.parseBuffer(convertedAudio, {
                mimeType: 'audio/wav',
              });

              sampleRate = fallbackMetadata.format.sampleRate || sampleRate;
              duration = fallbackMetadata.format.duration || duration;
              channels = fallbackMetadata.format.numberOfChannels || channels;
              bitsPerSample = fallbackMetadata.format.bitsPerSample || bitsPerSample;
              bitrate = fallbackMetadata.format.bitrate || bitrate;
            }

            return {
              format: {
                sampleRate,
                duration,
                numberOfChannels: channels,
                bitsPerSample,
                bitrate,
              },
            };
          }

          let metadata = await musicMetadata.parseBuffer(
            Buffer.from(myMediaFile.buffer),
            { mimeType: myMediaFile.mimetype },
          );

          if (!metadata.format.duration) {
            const convertedFile = await this.convertToWav(myMediaFile.buffer);
            metadata = await musicMetadata.parseBuffer(convertedFile, { mimeType: 'audio/wav' });
          }

          return metadata;
        } catch (error) {
          console.warn('Metadata extraction failed');
          return null;
          // throw new ServiceException(
          //   'Error getting audio metadata',
          //   ExceptionsEnum.InternalServerError,
          // );
        }
      })());

    //Set audio infos from metadata
    track.size = myMediaFile.size;
    if (myMetadata?.format) {
      track.rate = myMetadata?.format?.sampleRate;
      track.duration = myMetadata?.format?.duration;
      track.channels = myMetadata?.format?.numberOfChannels;
      track.bitrate = myMetadata?.format?.bitrate;
      track.resolution = myMetadata?.format?.bitsPerSample;
    }
    //Check for the file mimetype
    // track.extension = mimetypeToFileExtension(
    //   myMediaFile.mimetype,
    // ) as ValidExtension;

    const newAddedTrack = await this.trackModel.create(track);

    //storage update
    await this.fileStorageService.updateStorageUsage(track.user_id, Number(myMediaFile?.size), StorageType.GC)

    // let uploadMediaResult: string;
    let imageWaveSmallUrl: string;
    let imageWaveBigUrl: string;
    let artworkUrl: string;

    //Send message to create file on bucket
    try {
      // uploadMediaResult = await this.fileStorageService.uploadAudio(track.user_id, {
      //   id: newAddedTrack._id.toString(),
      //   fileCacheKey: myMediaFile.fileCacheKey,
      //   mimetype: myMediaFile.mimetype,
      //   size: myMediaFile.size,
      //   // isPublic means it goes in the public storage bucket - not that it belongs to a public project
      //   isPublic: false,
      // },
      //   {
      //     file: 'track',
      //     fileFor: 'track',
      //     track_id: newAddedTrack._id
      //   }
      // );

      if (imageWaveSmall) {
        imageWaveSmallUrl = await this.fileStorageService.uploadImage(track.user_id, {
          id: newAddedTrack._id.toString() + '_small',
          mimetype: imageWaveSmall.mimetype,
          fileCacheKey: imageWaveSmall.fileCacheKey,
          size: imageWaveSmall.size,
          isPublic: true,
        },
          {
            key: newAddedTrack._id.toString() + '_small',
            file: 'small',
            fileFor: 'track',
            track_id: newAddedTrack._id,
            newFile: true
          });

        newAddedTrack.imageWaveSmall = imageWaveSmallUrl;
      }

      if (imageWaveBig) {
        imageWaveBigUrl = await this.fileStorageService.uploadImage(track.user_id, {
          id: newAddedTrack._id.toString() + '_big',
          mimetype: imageWaveBig.mimetype,
          fileCacheKey: imageWaveBig.fileCacheKey,
          size: imageWaveBig.size,
          isPublic: true,
        },
          {
            key: newAddedTrack._id.toString() + '_big',
            file: 'big',
            fileFor: 'track',
            track_id: newAddedTrack._id,
            newFile: true
          }
        );

        newAddedTrack.imageWaveBig = imageWaveBigUrl;
      }

      if (artwork) {
        artworkUrl = await this.fileStorageService.uploadImage(track.user_id, {
          id: newAddedTrack._id.toString() + '_artwork',
          mimetype: artwork.mimetype,
          fileCacheKey: artwork.fileCacheKey,
          size: artwork.size,
          isPublic: true,
        },
          {
            key: newAddedTrack._id.toString() + '_artwork',
            file: 'artwork',
            fileFor: 'track',
            track_id: newAddedTrack._id,
            newFile: true
          });

        newAddedTrack.artwork = artworkUrl;
        newAddedTrack.artworkExtension = mimetypeToFileExtension(
          artwork.mimetype,
        );
      }
      await this.trackModel.findByIdAndUpdate(newAddedTrack._id, newAddedTrack);
    } catch (error) {
      await this.trackModel.deleteOne({
        _id: newAddedTrack._id,
      });

      //delete file from GC
      const fileName = `${newAddedTrack._id.toString()}.${newAddedTrack.extension}`
      await this.fileStorageService.deleteAudioFromGC(fileName)

      throw new ServiceException(
        'Error uploading file',
        ExceptionsEnum.InternalServerError,
      );
    }

    //If an error ocurred, try to remove the document and throw an error
    if (
      (imageWaveSmall &&
        !imageWaveSmallUrl.substring(0, 6).startsWith('https:')) ||
      (imageWaveBig && !imageWaveBigUrl.substring(0, 6).startsWith('https:')) ||
      (artwork && !artworkUrl.substring(0, 6).startsWith('https:'))
    ) {
      await this.trackModel.deleteOne({
        _id: newAddedTrack._id,
      });

      throw new ServiceException('Error uploading file', ExceptionsEnum.InternalServerError,);
    }

    const [trackPopulated] = await this.getAllTracks({
      filters: {
        _id: newAddedTrack._id,
      },
    });

    //gamification token assign
    await this.userActivityService.activity(track.user_id, EventTypeEnum.UPLOAD_FILE)

    //gamification token assign for mobile recorded track
    if (track?.isMobileRecorded) {
      await this.userActivityService.activity(track.user_id, EventTypeEnum.RECORD_WITH_MOBILE_APP)
    }

    return trackPopulated;
  }


  async convertToWav(buffer: Buffer): Promise<Buffer> {
    try {
      const ffmpeg = require('fluent-ffmpeg');

      return new Promise(async (resolve, reject) => {
        const inputStream = new Readable();
        inputStream.push(buffer);
        inputStream.push(null);

        const chunks: Buffer[] = [];
        const { PassThrough } = require('stream');
        const outputStream = new PassThrough();
        await ffmpeg(inputStream)
          .toFormat('wav')
          .on('error', (err) => {
            console.error('Error during WAV conversion:', err);
            reject(err);
          })
          .on('end', () => {
            resolve(Buffer.concat(chunks));
          })
          .pipe(outputStream);

        outputStream.on('data', (chunk) => chunks.push(chunk));
        outputStream.on('end', () => {
        });
      });
    } catch (err) {
      console.log('err: ', err)
    }
  }

  /**
   * Update track informations
   * @param userId User id
   * @param track_id Track id
   * @param track Object with track informations to update
   * @returns
   */
  async updateTrack({
    userId,
    track_id,
    trackDto,
  }: {
    userId: string;
    track_id: string;
    trackDto: updateTrack;
  }): Promise<any> {
    const {
      imageWaveSmall,
      imageWaveBig,
      artwork,
      lyrics: lyricsUpdated,
      ...updateTrack
    } = trackDto;
    const updateData: UpdateQuery<Track> = {
      ...updateTrack,
    };

    let imageWaveSmallUrl: string;
    let imageWaveBigUrl: string;
    let artworkUrl: string;

    try {
      if (imageWaveSmall) {
        imageWaveSmallUrl = await this.fileStorageService.uploadImage(userId, {
          id: track_id.toString() + '_small',
          mimetype: (imageWaveSmall as WaveformImage).mimetype,
          fileCacheKey: (imageWaveSmall as WaveformImage).fileCacheKey,
          size: (imageWaveSmall as WaveformImage).size,
          // isPublic means it goes in the public storage bucket - not that it belongs to a public project
          isPublic: true,
        },
          {
            key: track_id.toString() + '_small',
            file: 'small',
            fileFor: 'track',
            track_id: track_id,
            newFile: false
          });

        updateData['imageWaveSmall'] = imageWaveSmallUrl;
      }

      if (imageWaveBig) {
        imageWaveBigUrl = await this.fileStorageService.uploadImage(userId, {
          id: track_id.toString() + '_big',
          mimetype: (imageWaveBig as WaveformImage).mimetype,
          fileCacheKey: (imageWaveBig as WaveformImage).fileCacheKey,
          size: (imageWaveBig as WaveformImage).size,
          // isPublic means it goes in the public storage bucket - not that it belongs to a public project
          isPublic: true,
        },
          {
            key: track_id.toString() + '_big',
            file: 'big',
            fileFor: 'track',
            track_id: track_id,
            newFile: false
          }
        );

        updateData['imageWaveBig'] = imageWaveBigUrl;
      }

      if (artwork) {
        artworkUrl = await this.fileStorageService.uploadImage(userId, {
          id: track_id.toString() + '_artwork',
          mimetype: (artwork as WaveformImage).mimetype,
          fileCacheKey: (artwork as WaveformImage).fileCacheKey,
          size: (artwork as WaveformImage).size,
          // isPublic means it goes in the public storage bucket - not that it belongs to a public project
          isPublic: true,
        },
          {
            key: track_id.toString() + '_artwork',
            file: 'artwork',
            fileFor: 'track',
            track_id: track_id,
            newFile: false
          });

        updateData['artwork'] = artworkUrl;
      }


    } catch (error) {
      throw new ServiceException(
        'Error uploading file',
        ExceptionsEnum.InternalServerError,
      );
    }

    if (lyricsUpdated) {
      const track = await this.trackModel
        .findById(track_id)
        .select(['lyrics', 'test', 'name', 'user_id']);
      const rawTrack = JSON.parse(JSON.stringify(track));
      const trackHasLyrics = isValidObjectId(rawTrack.lyrics);

      if (trackHasLyrics) {
        await this.trackLyricsService.update({
          owner: userId,
          lyricsId: rawTrack.lyrics,
          lyricsDto: {
            lines: trackDto.lyrics.lines,
          },
        });
      } else {
        const newLyrics = await this.trackLyricsService.create({
          lyricsDto: {
            title: trackDto.name || track.name,
            lines: trackDto.lyrics.lines,
          },
          userId: new ObjectId(track.user_id),
        });

        updateData.lyrics = newLyrics._id;
      }
    }

    if (updateData.folder_id === null) {
      updateData.$unset = { folder_id: "" }; // Use $unset to remove folder_id
      delete updateData.folder_id; // Remove folder_id from the main object to avoid conflicts
    }

    return this.trackModel.updateOne(
      {
        _id: new ObjectId(track_id),
        user_id: new ObjectId(userId),
      },
      updateData,
    );
  }

  async deleteTrack(id: string, track_id: string): Promise<any> {
    //Get the extension for the file
    const deleteRes = await this.trackModel.find(
      { user_id: id, _id: track_id }, // Where clause
      // {
      //   extension: 1,
      // }, // Fields to return
    );

    if (deleteRes.length == 0) {
      throw new ServiceException('No track found', ExceptionsEnum.NotFound);
    }

    const trackProject = await this.trackProjectModel
      .find()
      .where('trackId')
      .equals(track_id);

    if (trackProject.length > 0) {
      throw new ServiceException(
        'Track is used in a project or/and release',
        ExceptionsEnum.BadRequest,
      );
    }

    //Send message to delete file on bucket
    const trackToDelete = deleteRes[0];

    try {
      await this.fileStorageService.deleteAudio(id, {
        name: trackToDelete._id.toString() + '.' + trackToDelete.extension,
      });

      if (trackToDelete.artwork) {
        await this.fileStorageService.deleteImageFromPublicBucket(
          id,
          // await this.getBucketAndImageName(trackToDelete.artwork)
          { imageName: trackToDelete._id.toString() + '_artwork', bucketName: this.configService.get<string>('PUBLIC_BUCKET') }

        )
      }
      if (trackToDelete.imageWaveBig) {
        await this.fileStorageService.deleteImageFromPublicBucket(
          id,
          // await this.getBucketAndImageName(trackToDelete.imageWaveBig)
          { imageName: trackToDelete._id.toString() + '_big', bucketName: this.configService.get<string>('PUBLIC_BUCKET') }
        )
      }
      if (trackToDelete.imageWaveSmall) {
        await this.fileStorageService.deleteImageFromPublicBucket(
          id,
          // await this.getBucketAndImageName(trackToDelete.imageWaveSmall)
          { imageName: trackToDelete._id.toString() + '_small', bucketName: this.configService.get<string>('PUBLIC_BUCKET') }
        )
      }
    } catch (error) { }

    return this.trackModel.deleteOne({
      user_id: id,
      _id: track_id,
    });
  }

  async getBucketAndImageName(url: string) {
    const match = url.match(/https:\/\/storage\.googleapis\.com\/(.*)\/(.*)/);

    if (match && match[1] && match[2]) {
      const bucketName = match[1];
      const imageName = match[2];

      return { bucketName, imageName };
    }

    throw new Error('Invalid Google Cloud Storage URL');
  }

  async getRecentTracksByUser(
    userId: string,
    limit = 10,
    filter: { startDate: string; endDate: string } | {} = {},
    search: string,
    page = 1,
  ) {
    const skip = (page - 1) * limit;

    let filters: any = {
      user_id: new ObjectId(userId),
    };

    if (search) {
      filters = {
        $and: [
          { name: { $regex: new RegExp('^' + search), $options: 'i' } },
          { user_id: new ObjectId(userId) },
        ],
      };
    }

    // Handle date range filtering
    if (filter['startDate'] && filter['endDate']) {
      const start = new Date(filter['startDate']);
      const end = new Date(filter['endDate']);
      if (start.toDateString() === end.toDateString()) {
        filters.createdAt = {
          $gte: start,
          $lt: new Date(start.getTime() + 86400000),
        };
      } else {
        filters.createdAt = { $gte: new Date(filter['startDate']) };
        filters.createdAt = { ...filters.createdAt, $lte: new Date(filter['endDate']), };
      }
    }

    // if (filter['startDate'] && filter['endDate']) {
    //   filters['createdAt'] = {
    //     $gte: new Date(filter['startDate']), // Start of the range
    //     $lte: new Date(filter['endDate']), // End of the range
    //   };
    // }

    const [tracks, total] = await Promise.all([
      this.getAllTracks({
        filters: filters,
        options: { withAudioUrl: true, isPreview: false },
        sortByRecent: true,
        limit: limit,
        skip: skip,
      }),
      this.trackModel.countDocuments(filters),
    ]);

    return {
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      tracks,
    };
  }

  async getTracksByUserId(id: string, filterDto: GetTracksFilterDto) {
    const {
      page = 1,
      limit = 20,
      sortOrder = SortOrder.DESC,
      genres = [],
      instruments = [],
      tags = [],
      trackType,
    } = filterDto;

    const skip = (page - 1) * limit;
    // Build match conditions
    const matchConditions: any = {
      user_id: new ObjectId(id),
      folder_id: { $exists: false },
    };

    if (genres.length > 0) {
      matchConditions.genre = { $in: genres.map((i) => new ObjectId(i)) };
    }

    if (instruments.length > 0) {
      matchConditions.instrument = {
        $in: instruments.map((i) => new ObjectId(i)),
      };
    }

    if (tags.length > 0) {
      matchConditions.tags = { $in: tags.map((t) => new ObjectId(t)) };
    }

    if (trackType) {
      switch (trackType) {
        case 'video':
          matchConditions.extension = { $in: ['mp4', 'avi', 'mov', 'quicktime'] };
          break;
        case 'audio':
          matchConditions.extension = { $in: ['wav', 'mp3', 'mp4a'] };
          break;
        default:
          break;
      }
    }

    const [tracks, total] = await Promise.all([
      this.getAllTracks({
        filters: matchConditions,
        options: { withAudioUrl: true, isPreview: false },
        sortByRecent: sortOrder === SortOrder.DESC,
        limit: limit,
        skip: skip,
      }),
      this.trackModel.countDocuments(matchConditions),
    ]);

    return {
      tracks,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all informations by track id
   * @param id Track id
   * @returns Track object
   */
  async getTrackById({
    id,
    owner,
    projectId,
    collaborationId,
    verifyTokenOwnershipDto,
  }: {
    id: string;
    owner: string;
    projectId?: string;
    collaborationId?: string;
    verifyTokenOwnershipDto?: VerifyTokenOwnershipDto;
    releaseId?: string;
  }) {
    const [requestedTrack] = await this.getAllTracks({
      filters: {
        _id: new ObjectId(id),
      },
      options: { withAudioUrl: true, isPreview: false },
    });

    if (!requestedTrack) {
      return null;
    }

    // CASE 1
    // If user is track owner, nothing else matters just give it to em.
    if (requestedTrack.user?._id.toString() === owner) {
      return requestedTrack;
    }

    if (verifyTokenOwnershipDto) {
      const { nftId, message, signature } = verifyTokenOwnershipDto || {
        nftId: '',
      };

      const nft = await this.nftModel
        .findOne({ _id: new ObjectId(nftId) })
        .populate({
          path: 'release',
          model: 'release',
          select: {
            isTokenGateKey: 1,
            _id: 1,
            selectedTracks: 1,
            finalVersions: 1,
          },
        });

      if (!nft) {
        throw new ServiceException(
          'nft not found.',
          ExceptionsEnum.InternalServerError,
        );
      }

      const {
        tokenId,
        editionContractAddress,
        project: nftProjectId,
        release,
        chainId,
      } = nft;

      const {
        isTokenGateKey,
        selectedTracks = [],
        finalVersions = [],
      } = (release || {}) as Release;

      // CASE 2
      const foundTrackProjects = await this.trackProjectModel.aggregate([
        {
          $match: {
            projectId: new ObjectId(nftProjectId?.toString()),
          },
        },
        {
          $project: {
            _id: 1,
            projectId: 1,
            trackId: 1,
          },
        },
      ]);

      // this is the array of un-lockable tracks currently associated
      // with the NFT's parent project. Tracks can be added or removed,
      // so this list can change over time, unlike the tracks associated
      // with a particular release, which should be available to token
      // holders at all times regardless of current association with project.
      const isRequestedTrackOwnedByNftProject = foundTrackProjects.some(
        ({ projectId }) => {
          return projectId?.toString() === nftProjectId?.toString();
        },
      );

      if (isTokenGateKey && isRequestedTrackOwnedByNftProject) {
        return requestedTrack;
      }

      // CASE 3
      let isTokenHolder = false;
      try {
        const res = await this.nftsService.verifyTokenOwnership({
          verifyTokenOwnershipDto: {
            signature,
            message,
            tokenId: String(tokenId),
            contractAddress: editionContractAddress,
            chainId,
          },
        });
        const { isOwner } = res;

        isTokenHolder = !!isOwner;
      } catch (error) {
        throw new ServiceException(
          'error verifying token ownership.',
          ExceptionsEnum.InternalServerError,
        );
      }

      const allTrackIdsOnToken = [...selectedTracks, ...finalVersions].map(
        (track) => String(track),
      );

      const isRequestedTrackUnlockableWithThisToken = !!allTrackIdsOnToken.find(
        (trackId) => !!trackId && !!id && trackId?.toString() === id,
      );

      if (isTokenHolder && isRequestedTrackUnlockableWithThisToken) {
        return requestedTrack;
      }
    }

    if (projectId) {
      const trackProject = await this.trackProjectModel
        .findOne()
        .where('trackId')
        .equals(id)
        .where('projectId')
        .equals(projectId)
        .exec();

      if (
        !trackProject &&
        (await this.applications.findOne({
          projectId,
          track: id,
        })) == null
      ) {
        throw new ServiceException('NotFound', ExceptionsEnum.NotFound);
      }

      const project = await this.projects.findById(projectId);

      const isLastVersionFromLastProjectRelease =
        this.isLastVersionFromLastProjectRelease(projectId, requestedTrack._id);
      const isPublicProject = !!project.isPublic;
      const isAvailableToAll =
        isLastVersionFromLastProjectRelease && isPublicProject;

      if (
        !isAvailableToAll &&
        !project?.collaborators.some(
          (collab) => collab.user.toString() === owner,
        ) &&
        project?.user.toString() !== owner
      ) {
        throw new ServiceException('NotFound', ExceptionsEnum.NotFound);
      }

      return requestedTrack;
    }

    if (collaborationId) {
      const collaboration = await this.collaborations.findOne(
        {
          _id: new ObjectId(collaborationId),
          track: new ObjectId(id),
        },
        { _id: 1, track: 1 },
      );

      if (!collaboration) {
        throw new ServiceException('NotFound', ExceptionsEnum.NotFound);
      }

      return requestedTrack;
    }

    throw new ServiceException('NotFound', ExceptionsEnum.NotFound);
  }

  /**
   * play or download track by id
   * @param id track id
   * @returns Tracks object
   */
  async playOrDownloadTrackById(id: string) {
    const [requestedTrack] = await this.getAllTracks({
      filters: {
        _id: new ObjectId(id),
      },
      options: { withAudioUrl: true, isPreview: false },
    });

    if (!requestedTrack) {
      return null;
    }
    return requestedTrack;
  }

  /**
   * Get track previe and restricted info about track
   * @param id Track id
   * @returns restricted Track object
   */
  async getTrackPreview({
    id,
    previewOnly = false,
    releaseId = '',
  }: {
    id: string;
    owner: string;
    previewOnly: boolean;
    releaseId: string;
  }) {
    if (!releaseId) {
      throw new ServiceException('Bad Request', ExceptionsEnum.BadRequest);
    }

    const [requestedTrack] = await this.getAllTracks({
      filters: {
        _id: new ObjectId(id),
      },
      options: { withAudioUrl: true, isPreview: true },
    });

    if (!requestedTrack) {
      return null;
    }

    // If the id of a complete release is provided,
    // and the track belongs to that release, then give the requester
    // some track info and the preview as the audioUrl
    const release = await this.releases.findOne({
      _id: new ObjectId(releaseId),
    });

    if (!release) {
      return;
    }

    const { finalVersions = [], status = '' } = release || {};
    const isRequestedTrackFinalVersionOnRelease = !!finalVersions.some(
      (finalVersion) => finalVersion?.toString() === id?.toString(),
    );
    const canPreview =
      status === 'FINISHED' && isRequestedTrackFinalVersionOnRelease;

    if (!canPreview) {
      return;
    }

    let restrictedTrack = requestedTrack;
    if (!previewOnly) {
      const [requestedTrackWithPreview] = await this.getAllTracks({
        filters: {
          _id: new ObjectId(id),
        },
        options: { withAudioUrl: true, isPreview: true },
      });

      restrictedTrack = requestedTrackWithPreview;
    }

    const { _id, previewEnd, previewStart, user, extension, name, url } =
      restrictedTrack || {};

    restrictedTrack = {
      _id,
      duration: previewEnd - previewStart,
      user,
      extension,
      name,
      url,
      previewEnd,
      previewStart,
    };

    return restrictedTrack;
  }

  /**
   * Return true if the track is the last version from the last project release.
   * Useful to the check if the track is available to all.
   *
   * @param {string|ObjectId} projectId Id of the project
   * @param {string|ObjectId} trackId   Id of the track
   * @returns {Promise<boolean>}
   */
  private async isLastVersionFromLastProjectRelease(
    projectId: string | ObjectId,
    trackId: string | ObjectId,
  ): Promise<boolean> {
    const lastRelease = await this.releases
      .findOne()
      .where('project')
      .equals(projectId)
      .sort({ createdAt: -1 })
      .exec();

    if (!lastRelease) {
      return false;
    }

    const { finalVersions } = lastRelease;

    if (!finalVersions || finalVersions.length === 0) {
      return false;
    }

    const lastFinalVersionTrackId = finalVersions[finalVersions.length - 1];

    return lastFinalVersionTrackId.toString() === trackId.toString();
  }

  /**
   * Get all informations by track id
   * @param id Track id
   * @returns Track object
   */
  async downloadTrackById(id: string) {
    const [track] = await this.trackModel.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          pipeline: [{ $project: { _id: 1, name: 1, profile_img: 1 } }],
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          user_id: 0,
        },
      },
    ]);

    const trackName = track._id + '.' + track.extension;

    try {
      const fileCacheKey = await this.fileStorageService.downloadAudioUrl({
        name: trackName,
      });

      return {
        fileCacheKey,
        trackName,
        extension: track.extension,
      };
    } catch (error) {
      throw new ServiceException(
        'Error downloading from tracks urls.' + JSON.stringify(error),
        ExceptionsEnum.InternalServerError,
      );
    }
  }

  /**
   * Get all tracks according to the filters
   *
   * @param filters Mongo queries to select documents
   * @returns
   */
  async getAllTracks({
    filters,
    options = {
      isPreview: false,
      withAudioUrl: true,
    },
    sortByRecent = false,
    limit,
    skip,
  }: {
    filters: any;
    options?: { withAudioUrl: boolean; isPreview: boolean };
    sortByRecent?: boolean;
    limit?: number;
    skip?: number;
  }) {
    const sortDescending = -1 as -1;
    const tracks = await this.trackModel.aggregate([
      { $match: filters },
      ...(sortByRecent ? [{ $sort: { createdAt: sortDescending } }] : []),
      ...(typeof skip === 'number' ? [{ $skip: skip }] : []),
      ...(typeof limit === 'number' ? [{ $limit: limit }] : []),
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          pipeline: [{ $project: { _id: 1, name: 1, profile_img: 1 } }],
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'tags',
          localField: 'tags',
          foreignField: '_id',
          as: 'tags',
        },
      },
      {
        $lookup: {
          from: 'skill_types',
          localField: 'instrument',
          foreignField: '_id',
          as: 'instrument',
        },
      },
      {
        $lookup: {
          from: 'styles',
          localField: 'genre',
          foreignField: '_id',
          as: 'genre',
        },
      },
      {
        $lookup: {
          from: 'lyrics',
          localField: 'lyrics',
          foreignField: '_id',
          as: 'lyrics',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          extension: 1,
          previewExtension: 1,
          size: 1,
          rate: 1,
          duration: 1,
          channels: 1,
          bitrate: 1,
          resolution: 1,
          imageWaveSmall: 1,
          imageWaveBig: 1,
          artwork: 1,
          artworkExtension: 1,
          createdAt: 1,
          updatedAt: 1,
          previewStart: 1,
          previewEnd: 1,
          folder_id: 1,
          isAIGenerated: 1,
          user: 1,
          url: 1,
          tags: { $ifNull: ['$tags', []] },
          instrument: { $ifNull: ['$instrument', []] },
          genre: { $ifNull: ['$genre', []] },
          lyrics: { $ifNull: ['$lyrics', []] }
        }
      }
    ]);

    const tracksMissingUrl = tracks
      .map((track, index) => ({ track, index }))
      .filter(({ track }) => !track.url);


    if (tracksMissingUrl.length === 0) {
      return tracks;
    }

    const trackNames = tracksMissingUrl.map(({ track }) =>
      options.isPreview
        ? `PREVIEW._${track._id}.${track?.previewExtension || 'mp3'}`
        : `${track._id}.${track.extension}`
    );

    try {
      const trackUrls = await this.fileStorageService.getAudioUrl({
        name: trackNames,
      });

      tracksMissingUrl.forEach(({ index }, i) => {
        tracks[index].url = trackUrls[i];
      });

      return tracks;
    } catch (error) {
      throw new ServiceException(
        'Error fetching track URLs (getAllTracks, tracks).' +
        JSON.stringify(error),
        ExceptionsEnum.InternalServerError
      );
    }

    // if (!options.withAudioUrl || tracks.length === 0) {
    //   return tracks;
    // }

    // // Build track names in parallel with aggregation
    // // const trackNames = tracks.map(track =>
    // //   options.isPreview
    // //     ? `PREVIEW._${track._id}.${track?.previewExtension || 'mp3'}`
    // //     : `${track._id}.${track.extension}`
    // // );

    // try {
    //   // Get all URLs in one batch request
    //   // const trackUrls = await this.fileStorageService.getAudioUrl({
    //   //   name: trackNames,
    //   // });

    //   // // Map URLs to tracks in memory (faster than pushing to new array)
    //   // return tracks.map((track, i) => {
    //   //   const url = trackUrls[i];
    //   //   return url ? { ...track, url } : null;
    //   // }).filter(Boolean); // Remove null entries
    //   return tracks
    // } catch (error) {
    //   throw new ServiceException(
    //     'Error searching from tracks urls (getAllTracks, tracks).' +
    //     JSON.stringify(error),
    //     ExceptionsEnum.InternalServerError,
    //   );
    // }
  }

  /**
   * Creater relationship between track and project
   * @param track_id
   * @param project_id
   * @param owner
   * @returns
   */
  async linkToProject({
    trackIds,
    projectId,
    owner,
  }: {
    trackIds: string[];
    projectId: string;
    owner: string;
  }) {
    const findDuplicated = await this.trackProjectModel
      .findOne()
      .where('trackId')
      .in(trackIds)
      .where('projectId')
      .equals(projectId)
      .exec();

    if (findDuplicated) {
      resourceDuplicatedError('Track x Project');
    }

    const promises = trackIds.map(
      async (trackId) =>
        await this.trackProjectModel.create({
          trackId: new ObjectId(trackId) as unknown,
          projectId: new ObjectId(projectId) as unknown,
        }),
    );

    const links = await Promise.all(promises);

    await this.projectService.addUpdate({
      type: ProjectUpdateEnum.ADDED_FILES_TO_MAIN_FOLDER,
      projectId: projectId,
      info: {
        tracks: trackIds,
      },
      userId: owner,
    });

    return links;
  }

  /**
   * Remove relationship between track and project
   * @param trackId Track id
   * @param projectId Project id
   * @returns
   */
  async removeFromProject({
    trackId,
    projectId,
    owner,
  }: {
    trackId: string[] | string;
    projectId: string;
    owner: string;
  }) {
    const trackIds = trackId instanceof Array ? trackId : [trackId];
    const project = await this.trackProjectModel
      .remove()
      .where('trackId')
      .in(trackIds)
      .where('projectId')
      .equals(projectId)
      .exec();

    const unlinkedTracks = typeof trackId === 'string' ? [trackId] : trackId;
    await this.projectService.addUpdate({
      type: ProjectUpdateEnum.UNLINKED_FILES_FROM_MAIN_FOLDER,
      projectId: projectId,
      info: {
        tracks: unlinkedTracks,
      },
      userId: owner,
    });

    return project;
  }

  /**
   * Get all projects who linked to track
   *
   * @param track_id
   * @returns
   */
  async getAllProjectsByTrack(trackId: string) {
    return await this.trackProjectModel.find({
      trackId: new ObjectId(trackId) as unknown,
    });
  }

  /**
   * Get all tracks from a project
   *
   * @param track_id
   * @returns
   */
  async getAllTracksByProject(projectId: string) {
    const tracksProjects = await this.trackProjectModel.find({
      projectId: new ObjectId(projectId) as unknown,
    });

    const allTracks = await this.getAllTracks({
      filters: {
        _id: {
          $in: tracksProjects.map((trackProject) => trackProject.trackId),
        },
      },
    });

    return allTracks.map((track) => {
      const linkedTrack = tracksProjects.find(
        (trackProject) =>
          trackProject.trackId.toString() === track._id.toString(),
      );
      return {
        ...track,
        linkedAt: linkedTrack?.createdAt || track.createdAt,
      };
    });
  }

  /**
   * Delete all tracks by user
   *
   * @param {string} userId User id
   */
  async deleteAllTracksByUser(userId: string) {
    const tracksFound = await this.trackModel.find({ user_id: userId });
    const promises = tracksFound.map(
      async (track) =>
        await this.trackProjectModel.deleteMany({ trackId: track._id }),
    );
    await Promise.all(promises);
    await this.trackModel.deleteMany({ user_id: userId });
    return;
  }

  async getFolderContent({
    user_id,
    filterDto,
  }: {
    user_id: string;
    filterDto: GetFolderContentDto;
  }) {
    const {
      folderID,
      page = 1,
      limit = 20,
      sortOrder = SortOrder.DESC,
      genres = [],
      instruments = [],
      tags = [],
    } = filterDto;

    const skip = (page - 1) * limit;

    // Build match conditions for tracks
    const matchConditions: any = {
      user_id: new ObjectId(user_id),
      folder_id: new ObjectId(folderID),
    };

    if (genres.length > 0) {
      matchConditions.genre = { $in: genres.map((g) => new ObjectId(g)) };
    }

    if (instruments.length > 0) {
      matchConditions.instrument = {
        $in: instruments.map((i) => new ObjectId(i)),
      };
    }

    if (tags.length > 0) {
      matchConditions.tags = { $in: tags.map((t) => new ObjectId(t)) };
    }

    const [tracksAggregation, total] = await Promise.all([
      this.trackModel.aggregate([
        {
          $match: matchConditions,
        },
        {
          $sort: { createdAt: sortOrder === SortOrder.ASC ? 1 : -1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            pipeline: [{ $project: { _id: 1, name: 1, profile_img: 1 } }],
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $lookup: {
            from: 'tags',
            localField: 'tags',
            foreignField: '_id',
            as: 'tags',
          },
        },
        {
          $lookup: {
            from: 'skill_types',
            localField: 'instrument',
            foreignField: '_id',
            as: 'instruments',
          },
        },
        {
          $lookup: {
            from: 'styles',
            localField: 'genre',
            foreignField: '_id',
            as: 'genres',
          },
        },
        {
          $lookup: {
            from: 'lyrics',
            localField: 'lyrics',
            foreignField: '_id',
            as: 'lyrics',
          },
        },
        {
          $addFields: {
            isFolder: false,
          },
        },
      ]),
      this.trackModel.countDocuments(matchConditions),
    ]);

    // Get folders (not paginated)
    const folders = await this.folderModel.aggregate([
      {
        $match: {
          parent_id: new ObjectId(folderID),
        },
      },
      {
        $sort: { createdAt: sortOrder === SortOrder.ASC ? 1 : -1 },
      },
      {
        $addFields: {
          isFolder: true,
        },
      },
    ]);

    // Get audio URLs for tracks
    const tracks = await Promise.all(
      tracksAggregation.map(async (track) => {
        try {
          const url = await this.fileStorageService.getAudioUrl({
            name: `${track._id}.${track.extension}`,
          });
          return { ...track, url };
        } catch (error) {
          return track;
        }
      }),
    );

    return {
      content: [...folders, ...tracks],
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async initiateComment(id: string, filterDto: IntiateCommentDto) {
    const { track_id, duration, comment } = filterDto;

    const trackCommentObj = {
      user_id: id,
      track_id,
      duration,
      comments: [
        {
          comment,
          commentedAt: new Date(),
          user_id: id,
        },
      ],
    };

    const project = await this.trackProjectModel.findOne({ trackId: track_id.toString() })

    //notification added
    const projectId = project.projectId.toString();
    const authorId = id;
    const trackId = track_id;

    await this.notificationsService.addedCommentToTrack(
      projectId,
      authorId,
      trackId,
    );

    return await this.trackCommentModel.create(trackCommentObj);
  }

  async addComment(id: string, filterDto: AddCommentDto) {
    const { track_comment_id, comment } = filterDto;

    const trackComment = await this.trackCommentModel.findById(
      track_comment_id,
    );
    if (!trackComment) {
      return false;
    }

    const comments = trackComment.comments;
    const newComment: any = {
      comment,
      commentedAt: new Date(),
      user_id: id,
    };
    comments.push(newComment);

    trackComment.comments = comments;
    await trackComment.save();

    const project = await this.trackProjectModel.findOne({ trackId: trackComment.track_id.toString() })

    //notification added
    const projectId = project.projectId.toString();
    const authorId = id;
    const trackId = trackComment.track_id.toString();

    await this.notificationsService.addedCommentToTrack(
      projectId,
      authorId,
      trackId,
    );

    return trackComment;
  }

  async deleteComment(id: string, filterDto: DeleteCommentDto) {
    const { track_comment_id, comment_id } = filterDto;

    const trackComment = await this.trackCommentModel.findById(
      track_comment_id,
    );
    if (!trackComment) {
      return false;
    }

    const comments = trackComment.comments.filter(
      (comment: any) => comment._id.toString() !== comment_id,
    );

    trackComment.comments = comments;
    await trackComment.save();

    return trackComment;
  }

  async markAsResolveComment(id: string, filterDto: MarkAsResolveCommentDto) {
    const { track_comment_id } = filterDto;

    const trackComment = await this.trackCommentModel.findById(
      track_comment_id,
    );
    if (!trackComment) {
      return false;
    }

    trackComment.isResolved = true;
    await trackComment.save();

    return trackComment;
  }

  async getTrackComment(track_comment_id: string) {
    const trackComment = await this.trackCommentModel.findById(
      track_comment_id,
    );
    if (!trackComment) {
      return false;
    }

    const comments = [...trackComment.comments].reverse();

    trackComment.comments = comments;

    return trackComment;
  }

  async getTrackComments(track_id: string) {
    const trackComments = await this.trackCommentModel.find({
      track_id,
    });

    return trackComments;
  }

  async trackNameCheck(owner: string, body: { names: string[] }) {
    const { names } = body

    const matchedTracks = await this.trackModel.find({
      name: { $in: names }
    }).select('name -_id');

    const matchedNames = matchedTracks.map(track => track.name);

    const res = {
      status: false,
      message: "Track name already exits.",
      data: matchedNames
    }

    return matchedNames.length > 0 ? res : {
      status: true,
      message: "Track name is available."
    }
  }
}

@Injectable()
export class FolderService {
  constructor(
    @InjectModel(Folder.name) private folderModel: Model<Folder>,
    @InjectModel(Track.name) private trackModel: Model<Track>,
    private readonly fileStorageService: FileStorageService,
  ) { }

  async createFolder({
    user_id,
    folder,
  }: {
    user_id: string;
    folder: createFolder;
  }) {
    const findDuplicated = await this.folderModel.findOne({
      user_id: user_id,
      parent_id: !folder.parent_id ? null : new ObjectId(folder.parent_id),
      name: folder.name,
    });

    if (findDuplicated != null) {
      throw new ServiceException(
        'Duplicated folder found',
        ExceptionsEnum.Conflict,
      );
    }

    if (folder.parent_id) {
      const validateId = await this.folderModel.findById(folder.parent_id);
      if (validateId == null) {
        throw new ServiceException(
          'Parent folder id do not exist',
          ExceptionsEnum.BadRequest,
        );
      }
    }

    return await this.folderModel.create({ user_id, ...folder });
  }

  async renameFolder({
    user_id,
    folder_id,
    name,
  }: {
    user_id: string;
    folder_id: string;
    name: string;
  }): Promise<any> {
    return this.folderModel.updateOne(
      {
        _id: new ObjectId(folder_id),
        user_id: new ObjectId(user_id),
      },
      { name },
      { new: true },
    );
  }

  async getRootFolders(id: string) {
    return this.folderModel.find({
      user_id: id,
      parent_id: null,
    });
  }

  async getFolderContent({
    user_id,
    filterDto,
  }: {
    user_id: string;
    filterDto: GetFolderContentDto;
  }) {
    const {
      folderID,
      page = 1,
      limit = 20,
      sortOrder = SortOrder.DESC,
      genres = [],
      instruments = [],
      tags = [],
    } = filterDto;

    const skip = (page - 1) * limit;

    // Build match conditions for tracks
    const matchConditions: any = {
      user_id: new ObjectId(user_id),
      folder_id: new ObjectId(folderID),
    };

    if (genres.length > 0) {
      matchConditions.genre = { $in: genres.map((g) => new ObjectId(g)) };
    }

    if (instruments.length > 0) {
      matchConditions.instrument = {
        $in: instruments.map((i) => new ObjectId(i)),
      };
    }

    if (tags.length > 0) {
      matchConditions.tags = { $in: tags.map((t) => new ObjectId(t)) };
    }

    const [tracksAggregation, total] = await Promise.all([
      this.trackModel.aggregate([
        {
          $match: matchConditions,
        },
        {
          $sort: { createdAt: sortOrder === SortOrder.ASC ? 1 : -1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            pipeline: [{ $project: { _id: 1, name: 1, profile_img: 1 } }],
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $lookup: {
            from: 'tags',
            localField: 'tags',
            foreignField: '_id',
            as: 'tags',
          },
        },
        {
          $lookup: {
            from: 'skill_types',
            localField: 'instrument',
            foreignField: '_id',
            as: 'instrument',
          },
        },
        {
          $lookup: {
            from: 'styles',
            localField: 'genre',
            foreignField: '_id',
            as: 'genre',
          },
        },
        {
          $lookup: {
            from: 'lyrics',
            localField: 'lyrics',
            foreignField: '_id',
            as: 'lyrics',
          },
        },
        {
          $addFields: {
            isFolder: false,
          },
        },
      ]),
      this.trackModel.countDocuments(matchConditions),
    ]);

    // Get folders (not paginated)
    const folders = await this.folderModel.aggregate([
      {
        $match: {
          parent_id: new ObjectId(folderID),
        },
      },
      {
        $sort: { createdAt: sortOrder === SortOrder.ASC ? 1 : -1 },
      },
      {
        $addFields: {
          isFolder: true,
        },
      },
    ]);

    // Get audio URLs for tracks
    const tracks = await Promise.all(
      tracksAggregation.map(async (track) => {
        try {
          const url = await this.fileStorageService.getAudioUrl({
            name: `${track._id}.${track.extension}`,
          });
          return { ...track, url };
        } catch (error) {
          return track;
        }
      }),
    );

    return {
      tracks: [...folders, ...tracks],
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async deleteFolder({
    user_id,
    folder_id,
  }: {
    user_id: string;
    folder_id: string;
  }) {
    const child = await this.folderModel.aggregate([
      {
        $match: {
          _id: new ObjectId(folder_id),
          user_id: new ObjectId(user_id),
        },
      },
      {
        $lookup: {
          from: 'tracks',
          localField: '_id',
          foreignField: 'folder_id',
          as: 'tracks',
        },
      },
      {
        $lookup: {
          from: 'folders',
          localField: '_id',
          foreignField: 'parent_id',
          as: 'folders',
        },
      },
    ]);

    if (child.length == 0) {
      throw new ServiceException(
        'Folder ID do not exist',
        ExceptionsEnum.BadRequest,
      );
    }

    const object = child[0];

    if (object.tracks.length > 0 || object.tracks.length > 0) {
      throw new ServiceException(
        'You can not delete this folder because it contains files inside',
        ExceptionsEnum.BadRequest,
      );
    }

    return this.folderModel.findByIdAndDelete(folder_id);
  }
}

@Injectable()
export class TagsService {
  constructor(@InjectModel(Tag.name) private tagModel: Model<Tag>) { }
  async getAllTags(lang: string) {
    const tags = await this.tagModel.find({}).sort({ title: 1 });
    return tags.map((x) => {
      const object = x.toObject() as unknown as {
        title: { [key: string]: string };
      };
      return {
        ...object,
        title:
          object.title[lang] == null
            ? object.title[DEFAULT_LANG]
            : object.title[lang],
      };
    });
  }
}
