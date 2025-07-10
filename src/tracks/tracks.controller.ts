/**
 *  @file Followers controller file. routes to be used in the module
 *  @author Rafael Marques Siqueira
 *  @exports FollowersController
 */

import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Query,
  Response,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { verify } from 'jsonwebtoken';
// import { Inject } from '@nestjs/common';
import { Observable } from 'rxjs';

import {
  DEFAULT_AUDIO_FILE_SIZE_LIMIT,
  DEFAULT_IMAGE_FILE_SIZE_LIMIT,
  ALLOWED_IMAGE_MIMETYPES,
  ALLOWED_AUDIO_MIMETYPES,
  DEFAULT_AUDIO_FILE_REDIS_CACHE_TTL,
  ALLOWED_VIDEO_MIMETYPES,
  ALLOWED_PROJECT_MIMETYPES,
} from './utils/consts';

// Services Imports
import { FolderService, TagsService, TracksService } from './tracks.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

// Dtos imports
import { createFolder } from './dto/createFolder.dto';
import { updateTrack } from './dto/updateTrack.dto';
import { LinkToProjectDto } from './dto/linkToProject.dto';

import {
  TransportImageType,
  TransportAudioType,
  InitialImageFileType,
  AudioFileType,
  ImageFileType,
} from './utils/types';

import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';
import { LoggingInterceptor } from '../interceptors/loggin.interceptor';
import { CreateLyricsDto } from './dto/createLyrics.dto';
import { UpdateLyricsDto } from './dto/updateLyrics.dto';
import { EditFolder } from './dto/editFolder';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TrackResponseDto } from './dto/definitions/trackResponse.dto';
import { ProjectResponseDto } from '../projects/dto/definitions/projectResponse.dto';
import { FolderResponseDto } from './dto/definitions/folderResponse.dto';
import { FolderContentResponse } from './dto/definitions/folderContentResponse.dto';
import { LyricsResponseDto } from '../docs/dto/lyricsResponse.dto';
import { TagResponseDto } from './dto/definitions/tagResponse.dto';
import { ProjectGetterService } from '../projects/services/projectGetter.service';
import { resourceForbiddenError } from './utils/errors';
import { createTrackInitialDto } from './dto/createTrackInitial.dto';
import { TrackLyricsService } from './services/trackLyrics.service';
import { ProjectsAuthGuard, ResourceAuthGuard, ResourceType } from './guards';
import { LyricsAuthGuard } from './guards/lyrics-auth.guard';
import { GetTracksFilterDto } from './dto/getTracksFilter.dto';
import { GetFolderContentDto } from './dto/getFolderContent';
import { IntiateCommentDto } from './dto/intiateComment.dto';
import { AddCommentDto } from './dto/addComment.dto';
import { DeleteCommentDto } from './dto/deleteComment.dto';
import { MarkAsResolveCommentDto } from './dto/markAsResolveComment.dto';
import { FeatureValidationGuard } from '../guards/feature-validation.guard';
import { Features } from '../decorators/features.decorator';
import { LyricsDto } from './dto/lyrics.dto';
import { FileStorageService } from '../file-storage/fileStorage.service';
import { FileUploadDTO } from './dto/fileUpload.dto';

@Controller('tracks')
@UseInterceptors(LoggingInterceptor)
@ApiTags('Tracks')
@ApiBearerAuth()
export class TracksController {
  constructor(
    private readonly tracksService: TracksService,
    private readonly projectGetterService: ProjectGetterService,
    private readonly fileStorageService: FileStorageService,
    @InjectRedis() private readonly redis: Redis,
  ) { }

  async addImageToRedis({
    imageFile,
    imageName,
    trackName,
    owner,
  }: {
    imageFile: InitialImageFileType;
    imageName: string;
    trackName: string;
    owner: string;
  }) {
    const imageCacheKey =
      trackName.trim().replace(/\s/g, '') +
      imageName +
      owner +
      '_' +
      Date.now();

    //Save to the redis
    await this.redis.setBuffer(
      imageCacheKey,
      imageFile.buffer,
      'EX',
      DEFAULT_AUDIO_FILE_REDIS_CACHE_TTL,
    );

    const imageWaveTransferObj: TransportImageType = {
      mimetype: imageFile.mimetype,
      fileCacheKey: imageCacheKey,
      size: imageFile.size,
    };

    return imageWaveTransferObj;
  }

  @UseGuards(JwtAuthGuard, FeatureValidationGuard)
  @Features([
    { featureKey: 'storage' },
  ])
  @Post()
  // @UseInterceptors(
  //   FileFieldsInterceptor(
  //     [
  //       { name: 'file', maxCount: 1 },
  //       { name: 'imageWaveSmall', maxCount: 1 },
  //       { name: 'imageWaveBig', maxCount: 1 },
  //       { name: 'artwork', maxCount: 1 },
  //     ],
  //     {
  //       limits: {
  //         fileSize: DEFAULT_AUDIO_FILE_SIZE_LIMIT,
  //       },
  //       fileFilter: (_: Request, file, cb) => {
  //         if (!file) {
  //           return cb(null, true);
  //         }

  //         if (
  //           !ALLOWED_AUDIO_MIMETYPES.includes(file.mimetype) &&
  //           !ALLOWED_IMAGE_MIMETYPES.includes(file.mimetype) &&
  //           !ALLOWED_VIDEO_MIMETYPES.includes(file.mimetype) &&
  //           !ALLOWED_PROJECT_MIMETYPES.includes(file.mimetype)
  //         ) {
  //           cb(new Error('Invalid file type'), false);
  //         }

  //         return cb(null, true);
  //       },
  //     },
  //   ),
  // )
  @ApiOperation({
    summary: 'Create a new track',
  })
  @ApiOkResponse({
    description: 'The created track',
    type: TrackResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async createTrack(
    @Param('owner') owner: string,
    @UploadedFiles()
    files: {
      file: AudioFileType[];
      imageWaveSmall: InitialImageFileType[];
      imageWaveBig: InitialImageFileType[];
      artwork: InitialImageFileType[];
    },
    @Body() track: createTrackInitialDto,
  ): Promise<any> {
    const { file, imageWaveSmall, imageWaveBig, artwork } = files;

    if ((!file || (file && !file[0])) && !track.url) {
      throw 'File is undefined';
    }

    if (imageWaveSmall && !imageWaveSmall[0]) {
      throw 'ImageWaveSmall is undefined';
    }

    if (imageWaveBig && !imageWaveBig[0]) {
      throw 'ImageWaveBig is undefined';
    }

    //Add file infos to the track obj
    const trackData = {
      ...track,
      file: null,
      imageWaveSmall: null,
      imageWaveBig: null,
      artwork: null,
    };

    //Add file infos if exists
    if (file && file[0]) {
      const { mimetype } = file[0];
      const [type] = mimetype.split('/');

      //Add the file info to the redis
      const fileCacheKey = `${track.name
        .trim()
        .replace(/\s/g, '')}_${type}_${owner}_${Date.now()}`;

      //Save to the redis
      try {
        await this.redis.setBuffer(
          fileCacheKey,
          file[0].buffer,
          'EX',
          DEFAULT_AUDIO_FILE_REDIS_CACHE_TTL,
        );
      } catch (error) {
        throw 'Error saving file on cache';
      }

      const mediaFileTransferObj: TransportAudioType = {
        fileCacheKey: fileCacheKey,
        mimetype: file[0].mimetype,
        size: file[0].size,
      };

      trackData.file = mediaFileTransferObj;
    }

    //Add the wave images to the redis
    ////Add small image
    if (imageWaveSmall && imageWaveSmall[0]) {
      const smallImageCacheKey =
        track.name.trim().replace(/\s/g, '') +
        '_waveform_small_' +
        owner +
        '_' +
        Date.now();

      //Save to the redis

      try {
        await this.redis.setBuffer(
          smallImageCacheKey,
          imageWaveSmall[0].buffer,
          'EX',
          DEFAULT_AUDIO_FILE_REDIS_CACHE_TTL,
        );
      } catch (error) {
        throw 'Error saving small waveform file on cache';
      }

      const imageWaveSmallTransferObj: TransportImageType = {
        mimetype: imageWaveSmall[0].mimetype,
        fileCacheKey: smallImageCacheKey,
        size: imageWaveSmall[0].size,
      };

      trackData.imageWaveSmall = imageWaveSmallTransferObj;
    }
    //////Small image added

    ////Add big image
    if (imageWaveBig && imageWaveBig[0]) {
      const bigImageCacheKey =
        track.name.trim().replace(/\s/g, '') +
        '_waveform_big_' +
        owner +
        '_' +
        Date.now();

      //Save to the redis
      try {
        await this.redis.setBuffer(
          bigImageCacheKey,
          imageWaveBig[0].buffer,
          'EX',
          DEFAULT_AUDIO_FILE_REDIS_CACHE_TTL,
        );
      } catch (error) {
        throw 'Error saving big waveform file on cache';
      }

      const imageWaveBigTransferObj: TransportImageType = {
        mimetype: imageWaveBig[0].mimetype,
        fileCacheKey: bigImageCacheKey,
        size: imageWaveBig[0].size,
      };

      trackData.imageWaveBig = imageWaveBigTransferObj;
    }
    //////Big image added

    // Handle artwork upload
    if (artwork?.[0] || track.artworkUrl) {
      const artworkCacheKey = `${track.name
        .trim()
        .replace(/\s/g, '')}_artwork_${owner}_${Date.now()}`;
      let buffer = artwork?.[0]?.buffer;

      const artworkTransferObj: TransportImageType = {
        fileCacheKey: artworkCacheKey,
        mimetype: artwork?.[0]?.mimetype,
        size: artwork?.[0]?.size,
      };

      if (track.artworkUrl) {
        const blob: any = await fetch(track.artworkUrl).then((r: any) =>
          r.blob(),
        );
        buffer = Buffer.from(await blob.arrayBuffer());
        artworkTransferObj.mimetype = blob.type;
        artworkTransferObj.size = blob.size;
        delete trackData.artworkUrl;
      }

      try {
        await this.redis.setBuffer(
          artworkCacheKey,
          buffer,
          'EX',
          DEFAULT_IMAGE_FILE_SIZE_LIMIT,
        );
      } catch (error) {
        throw 'Error saving artwork file on cache';
      }

      trackData.artwork = artworkTransferObj;
    }

    return this.tracksService.createTrack({
      user_id: owner,
      ...trackData,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('list')
  @ApiOperation({
    summary: 'Get all tracks of current user with filters and pagination',
  })
  @ApiOkResponse({
    description: 'The tracks of current user',
    type: [TrackResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getTracks(
    @Param('owner') owner: string,
    @Body() filterDto: GetTracksFilterDto,
  ) {
    return this.tracksService.getTracksByUserId(owner, filterDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('getRecentTracksByUser')
  @ApiOperation({
    summary: 'Get all tracks of current user',
  })
  @ApiOkResponse({
    description: 'The recent tracks of current user',
    type: [TrackResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiQuery({
    name: 'limit',
    required: false,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
  })
  @ApiQuery({
    name: 'search',
    required: false,
  })
  getRecentTracksByUser(
    @Param('owner') owner: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string | null,
    @Query('endDate') endDate?: string | null,
    @Query('search') search?: string | null,
    @Query('page') page?: string,
  ) {
    return this.tracksService.getRecentTracksByUser(
      owner,
      parseInt(limit ?? '10'),
      { startDate, endDate },
      search,
      parseInt(page ?? '1'),
    );
  }

  @Get(':trackId')
  @ApiOperation({
    summary: 'Get a track by id',
  })
  @ApiOkResponse({
    description: 'The track',
    type: TrackResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Track not found' })
  getTrackById(
    @Headers('authorization') token: string,
    @Param('trackId') trackId: string,
    @Query('nftId') nftId: string,
    @Query('message') message: string,
    @Query('signature') signature: string,
  ): Promise<any> {
    let owner = '';
    if (token) {
      const verified = verify(
        token.split(' ')[1],
        process.env.SECRET_KEY,
      ) as any;
      const { sub } = verified || {};
      owner = sub;
    }

    const shouldVerifyTokenOwnership = !!nftId && !!message && !!signature;

    const verifyTokenOwnershipDto = { nftId, message, signature };

    return this.tracksService.getTrackById({
      owner,
      id: trackId,
      ...(shouldVerifyTokenOwnership ? { verifyTokenOwnershipDto } : {}),
    });
  }

  @Get('preview/:trackId')
  @ApiOperation({
    summary: 'Get a track preview by id and release id',
  })
  @ApiOkResponse({
    description: 'The track',
    type: TrackResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Track not found' })
  getTrackPreview(
    @Headers('authorization') token: string,
    @Param('trackId') trackId: string,
    @Query('releaseId') releaseId: string,
    @Query('previewOnly') previewOnly: string | boolean,
  ): Promise<any> {
    previewOnly = !!previewOnly;

    let owner = '';
    if (token) {
      const verified = verify(
        token.split(' ')[1],
        process.env.SECRET_KEY,
      ) as any;
      const { sub } = verified || {};
      owner = sub;
    }

    return this.tracksService.getTrackPreview({
      owner,
      id: trackId,
      previewOnly,
      releaseId,
    });
  }

  @Get('getTrack/:trackId')
  @ApiOperation({
    summary: 'Get a track by id for play or download purpose only',
  })
  @ApiOkResponse({
    description: 'The track',
  })
  @ApiNotFoundResponse({ description: 'Track not found' })
  getTrack(@Param('trackId') trackId: string): Promise<any> {
    return this.tracksService.playOrDownloadTrackById(trackId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':trackId/downloads')
  @ApiOperation({
    summary: 'Get all downloads of a track',
  })
  @ApiOkResponse({
    description: 'The downloads of a track',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Track not found' })
  async downloadTrackById(
    @Param('owner') owner: string,
    @Param('trackId') trackId: string,
    @Response() res: any,
  ): Promise<any> {
    const { fileCacheKey, trackName } =
      await this.tracksService.downloadTrackById(trackId);

    const buffer = await this.redis.getBuffer(fileCacheKey);

    res.set({
      'Content-disposition': `attachment; filename=${trackName}`,
    });

    res.send(buffer);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':trackId/projects/:projectId')
  @ApiOperation({
    summary: 'Get a track by id and project id',
  })
  @ApiOkResponse({
    description: 'The track',
    type: TrackResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  getTrackByIdWithProjectId(
    @Param('owner') owner: string,
    @Param('trackId') trackId: string,
    @Param('projectId') projectId: string,
    @Query('nftId') nftId: string,
    @Query('message') message: string,
    @Query('signature') signature: string,
  ): Promise<any> {
    const shouldVerifyTokenOwnership = !!nftId && !!message && !!signature;

    const verifyTokenOwnershipDto = { nftId, message, signature };

    return this.tracksService.getTrackById({
      owner,
      id: trackId,
      projectId,
      ...(shouldVerifyTokenOwnership ? { verifyTokenOwnershipDto } : {}),
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':trackId/collaborations/:collaborationId')
  @ApiOperation({
    summary: 'Get a track by id and collaboration id',
  })
  @ApiOkResponse({
    description: 'The track',
    type: TrackResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  getTrackByIdWithCollaborationId(
    @Param('owner') owner: string,
    @Param('trackId') trackId: string,
    @Param('collaborationId') collaborationId: string,
  ): Promise<any> {
    return this.tracksService.getTrackById({
      owner,
      id: trackId,
      collaborationId,
    });
  }

  @UseGuards(JwtAuthGuard, ResourceAuthGuard(ResourceType.Tracks), FeatureValidationGuard)
  @Features([
    { featureKey: 'storage' },
  ])
  @Put(':track_id')
  // @UseInterceptors(
  //   FileFieldsInterceptor(
  //     [
  //       { name: 'imageWaveSmall', maxCount: 1 },
  //       { name: 'imageWaveBig', maxCount: 1 },
  //       { name: 'artwork', maxCount: 1 },
  //     ],
  //     {
  //       limits: {
  //         files: 3,
  //         fileSize: DEFAULT_IMAGE_FILE_SIZE_LIMIT,
  //       },
  //       fileFilter: (_: Request, file, cb) => {
  //         if (!file) {
  //           return cb(null, true);
  //         }

  //         if (!ALLOWED_IMAGE_MIMETYPES.includes(file.mimetype)) {
  //           cb(new Error('Invalid file type'), false);
  //         }
  //         return cb(null, true);
  //       },
  //     },
  //   ),
  // )
  @ApiOperation({
    summary: 'Update a track',
  })
  @ApiOkResponse({
    description: 'The track updated',
    type: TrackResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Track not found' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  async updateTrack(
    @Param('owner') owner: string,
    @Param('track_id') id: string,
    @Body() track: updateTrack,
    @UploadedFiles()
    files: {
      imageWaveSmall: InitialImageFileType[];
      imageWaveBig: InitialImageFileType[];
      artwork: InitialImageFileType[];
    },
  ): Promise<any> {
    const { imageWaveBig, imageWaveSmall, artwork } = files || {};

    //Add file infos to the track obj
    const trackData = {
      ...track,
      imageWaveSmall: null,
      imageWaveBig: null,
      artwork: null
    };

    // When update wave images we need the name of the track,
    if (
      ((imageWaveSmall && imageWaveSmall[0]) ||
        (imageWaveBig && imageWaveBig[0])) &&
      !track?.name
    ) {
      throw 'Track name is required to update wave track images';
    }

    if (imageWaveBig && imageWaveBig[0]) {
      try {
        trackData.imageWaveBig = await this.addImageToRedis({
          imageFile: imageWaveBig[0],
          imageName: '_waveform_big_',
          trackName: track.name,
          owner,
        });
      } catch (error) {
        throw 'Error saving big waveform file on cache';
      }
    }

    if (imageWaveSmall && imageWaveSmall[0]) {
      try {
        trackData.imageWaveSmall = await this.addImageToRedis({
          imageFile: imageWaveSmall[0],
          imageName: '_waveform_small_',
          trackName: track.name,
          owner,
        });
      } catch (error) {
        throw 'Error saving small waveform file on cache';
      }
    }


    if (artwork && artwork[0]) {
      try {
        trackData.artwork = await this.addImageToRedis({
          imageFile: artwork[0],
          imageName: '_artwork_',
          trackName: track.name,
          owner,
        });
      } catch (error) {
        throw 'Error saving artwork file on cache';
      }
    }

    return this.tracksService.updateTrack({
      userId: owner,
      track_id: id,
      trackDto: trackData,
    });
  }

  @UseGuards(JwtAuthGuard, ResourceAuthGuard(ResourceType.Tracks))
  @Delete(':track_id')
  @ApiOperation({
    summary: 'Delete a track',
  })
  @ApiOkResponse({
    description: 'Success with no data',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Track not found' })
  deleteTrack(
    @Param('owner') owner: string,
    @Param('track_id') id: string,
  ): Promise<any> {
    return this.tracksService.deleteTrack(owner, id);
  }

  /**
   * Link a track to a project
   *
   * @param {LinkTotProjectDto} linkToProject Dto to add tracks in a project
   * @param {string} owner Owner id of track and project
   * @param projectId Project id
   * @returns
   */
  @UseGuards(JwtAuthGuard, ResourceAuthGuard(ResourceType.Tracks))
  @Post('projects/:projectId')
  @ApiOperation({
    summary: 'Link a track to a project',
  })
  @ApiOkResponse({
    description: 'Success with no data',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Track or project not found' })
  async linkToProject(
    @Param('owner') owner: string,
    @Body() linkToProject: LinkToProjectDto,
    @Param('projectId') projectId: string,
  ): Promise<any[]> {
    const project = (await this.projectGetterService.getProject({
      projectId,
      owner,
      // TODO: REMOVE ANY
    })) as any;

    const filterCollaborators =
      project.collaborators
        ?.filter((collaborator: any) => collaborator.permission !== 'VIEW_ONLY')
        .map((collaborator: any) => collaborator.user?._id) || [];

    const collaboratorIds = [project.user._id, ...filterCollaborators];

    if (collaboratorIds.includes(owner)) {
      return this.tracksService.linkToProject({
        owner,
        trackIds: linkToProject.trackIds,
        projectId,
      });
    }

    return resourceForbiddenError();
  }

  /**
   * Remove track from project
   *
   * @param owner Owner id of track and project
   * @param trackId Track id
   * @param projectId Project id
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':trackId/projects/:projectId')
  @ApiOperation({
    summary: 'Remove track from project',
  })
  @ApiOkResponse({
    description: 'Success with no data',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Track or project not found' })
  async removeFromProject(
    @Param('owner') owner: string,
    @Param('trackId') trackId: string,
    @Param('projectId') projectId: string,
  ): Promise<any[]> {
    const project = (await this.projectGetterService.getProject({
      projectId,
      owner,
      // TODO: REMOVE ANY
    })) as any;

    const filterCollaborators =
      project.collaborators
        ?.filter((collaborator: any) =>
          ['OWNER', 'EDITOR', 'PRODUCER'].includes(collaborator.permission),
        )
        .map((collaborator: any) => collaborator.user?._id) || [];

    const collaboratorIds = [project.user._id, ...filterCollaborators];

    if (collaboratorIds.includes(owner)) {
      return this.tracksService.removeFromProject({
        owner,
        trackId,
        projectId,
      });
    }

    return resourceForbiddenError();
  }

  /**
   * Receive request to get all projects from track
   *
   * @param owner Owner id of track
   * @param trackId Track id
   * @returns
   */
  @UseGuards(JwtAuthGuard, ResourceAuthGuard(ResourceType.Tracks))
  @Get(':trackId/projects')
  @ApiOperation({
    summary: 'Get all projects from track',
  })
  @ApiOkResponse({
    description: 'Projects from track',
    type: [ProjectResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Track not found' })
  async getAllProjectsByTrack(
    @Param('owner') owner: string,
    @Param('trackId') id: string,
  ): Promise<any[]> {
    const tracksProjects = await this.tracksService.getAllProjectsByTrack(id);

    const projectIds: string[] = tracksProjects.map((trackProject) =>
      trackProject.projectId?.toString(),
    );

    return this.projectGetterService.getAllProjectsByIds(projectIds);
  }

  /**
   * Receive request to get all tracks from project
   *
   * @param owner Owner id of track
   * @param trackId Track id
   * @returns
   */
  @UseGuards(JwtAuthGuard, ProjectsAuthGuard())
  @Get('projects/:projectId')
  @ApiOperation({
    summary: 'Get all tracks from project',
  })
  @ApiOkResponse({
    description: 'Tracks from project',
    type: [TrackResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  getAllTracksByProject(
    // @Param('owner') owner: string,
    @Param('projectId') projectId: string,
  ): Promise<any> {
    return this.tracksService.getAllTracksByProject(projectId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('initiate-comment')
  @ApiOperation({})
  @ApiOkResponse({
    description: 'The tracks of current user',
    type: [TrackResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  intiateComment(
    @Param('owner') owner: string,
    @Body() filterDto: IntiateCommentDto,
  ) {
    return this.tracksService.initiateComment(owner, filterDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('add-comment')
  @ApiOperation({})
  @ApiOkResponse({
    description: 'The tracks of current user',
    type: [TrackResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  addComment(@Param('owner') owner: string, @Body() filterDto: AddCommentDto) {
    return this.tracksService.addComment(owner, filterDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('delete-comment')
  @ApiOperation({})
  @ApiOkResponse({
    description: 'The tracks of current user',
    type: [TrackResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  deleteComment(
    @Param('owner') owner: string,
    @Body() filterDto: DeleteCommentDto,
  ) {
    return this.tracksService.deleteComment(owner, filterDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mark-as-resolve-comment')
  @ApiOperation({})
  @ApiOkResponse({
    description: 'The tracks of current user',
    type: [TrackResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  markAsResolveComment(
    @Param('owner') owner: string,
    @Body() filterDto: MarkAsResolveCommentDto,
  ) {
    return this.tracksService.markAsResolveComment(owner, filterDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-track-comment')
  @ApiOperation({})
  @ApiOkResponse({
    description: 'The tracks of current user',
    type: [TrackResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getTrackComment(@Param('track_comment_id') track_comment_id: string) {
    return this.tracksService.getTrackComment(track_comment_id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-track-comments')
  @ApiOperation({})
  @ApiOkResponse({
    description: 'The tracks of current user',
    type: [TrackResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getTrackComments(@Param('track_id') track_id: string) {
    return this.tracksService.getTrackComments(track_id);
  }


  @UseGuards(JwtAuthGuard)
  @Post('generate-upload-url')
  @ApiOperation({
    summary: 'Get track lyrics',
  })
  @ApiOkResponse({
    description: 'Returns track lyrics',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  fileUpload(
    @Param('owner') owner: string,
    @Body() filterDto: FileUploadDTO,
  ): Promise<any> {
    return this.fileStorageService.generateUploadUrl(filterDto);
  }

  //delete url from GC
  @UseGuards(JwtAuthGuard)
  @Post('delete-upload-url')
  @ApiOperation({
    summary: '',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  deleteUploadUrl(
    @Param('owner') owner: string,
    @Body() fileName: string,
  ): Promise<any> {
    return this.fileStorageService.deleteAudioFromGC(fileName)
  }


  //track name check
  @UseGuards(JwtAuthGuard)
  @Post('track-name')
  @ApiOperation({
    summary: '',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  trackName(
    @Param('owner') owner: string,
    @Body() body: { names: string[] }
  ): Promise<any> {
    return this.tracksService.trackNameCheck(owner, body)
  }
}

@Controller('folders')
@ApiTags('Folders')
@ApiBearerAuth()
export class FolderController {
  constructor(
    private readonly tracksService: TracksService,
    private readonly folderService: FolderService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @Put(':folder_id')
  @ApiOperation({
    summary: 'Rename a folder',
  })
  @ApiOkResponse({
    description: 'Success',
    type: FolderResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Folder not found' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  renameFolder(
    @Param('owner') owner: string,
    @Param('folder_id') id: string,
    @Body() folder: EditFolder,
  ): Promise<any> {
    return this.folderService.renameFolder({
      user_id: owner,
      folder_id: id,
      name: folder.name,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Create a folder',
  })
  @ApiOkResponse({
    description: 'Returns the created folder',
    type: FolderResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  createFolder(
    @Param('owner') owner: string,
    @Body() folder: createFolder,
  ): Promise<any> {
    return this.folderService.createFolder({
      user_id: owner,
      folder,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('roots')
  @ApiOperation({
    summary: 'Get all root folders',
  })
  @ApiOkResponse({
    description: 'Returns all root folders',
    type: [FolderResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getRootFolders(@Param('owner') owner: string): Promise<any> {
    return this.folderService.getRootFolders(owner);
  }

  @UseGuards(JwtAuthGuard)
  @Post('folder-content')
  @ApiOperation({
    summary: 'Get folder content with pagination and filters',
  })
  @ApiOkResponse({
    description: 'Returns folder content',
    type: [FolderContentResponse],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Folder not found' })
  getFolderContent(
    @Param('owner') owner: string,
    @Body() filterDto: GetFolderContentDto,
  ): Promise<any> {
    return this.folderService.getFolderContent({
      user_id: owner,
      filterDto,
    });
  }

  @UseGuards(JwtAuthGuard, ResourceAuthGuard(ResourceType.Tracks))
  @Delete(':folder_id')
  @ApiOperation({
    summary: 'Delete a folder',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Folder not found' })
  deleteFolder(
    @Param('owner') owner: string,
    @Param('folder_id') folder_id: string,
  ): Promise<any> {
    return this.folderService.deleteFolder({
      user_id: owner,
      folder_id,
    });
  }
}

@Controller('tags')
@ApiTags('Tags')
@ApiBearerAuth()
export class TagsController {
  constructor(private readonly tagsService: TagsService) { }
  @Get(':lang/')
  @ApiOperation({
    summary: 'Get all tags',
  })
  @ApiOkResponse({
    description: 'Returns all tags',
    type: [TagResponseDto],
  })
  getTags(@Param('lang') lang: string): Promise<any> {
    return this.tagsService.getAllTags(lang);
  }
}

@Controller('lyrics')
@ApiTags('Lyrics')
export class LyricsController {
  constructor(private readonly trackLyricsService: TrackLyricsService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Create a lyrics',
  })
  @ApiOkResponse({
    description: 'Returns the created lyrics',
    type: LyricsResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  createLyrics(
    @Param('owner') owner: string,
    @Body() lyricsDto: CreateLyricsDto,
  ): Promise<any> {
    return this.trackLyricsService.create({
      userId: owner,
      lyricsDto,
      trackId: lyricsDto.trackId,
      projectId: lyricsDto.projectId,
    });
  }

  @UseGuards(JwtAuthGuard, LyricsAuthGuard())
  @Put(':lyrics_id')
  @ApiOperation({
    summary: 'Edit a lyrics',
  })
  @ApiOkResponse({
    description: 'Returns the edited lyrics',
    type: LyricsResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiNotFoundResponse({ description: 'Lyrics not found' })
  updateLyrics(
    @Param('owner') owner: string,
    @Param('lyrics_id') lyricsId: string,
    @Body() lyricsDto: LyricsDto,
  ): Promise<any> {
    return this.trackLyricsService.update({
      lyricsId,
      lyricsDto,
      owner
    });
  }

  @UseGuards(JwtAuthGuard, LyricsAuthGuard())
  @Delete(':lyrics_id')
  @ApiOperation({
    summary: 'Delete a lyrics',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Lyrics not found' })
  deleteLyrics(
    @Param('owner') owner: string,
    @Param('lyrics_id') lyricsId: string,
  ): Promise<any> {
    return this.trackLyricsService.delete({
      userId: owner,
      lyricsId,
    });
  }

  @UseGuards(JwtAuthGuard, ResourceAuthGuard(ResourceType.Tracks))
  @Get(':lyrics_id')
  @ApiOperation({
    summary: 'Get track lyrics',
  })
  @ApiOkResponse({
    description: 'Returns track lyrics',
    type: [LyricsResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getLyricsFromUser(
    @Param('owner') owner: string,
    @Param('lyrics_id') lyricsId: string
  ): Promise<any> {
    return this.trackLyricsService.get({
      userId: owner,
      lyricsId,
    });
  }
}
