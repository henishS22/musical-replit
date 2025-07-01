import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Headers,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Logger,
  Req,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { Redis } from 'ioredis';
import { LoggingInterceptor } from '../interceptors/loggin.interceptor';
// Dtos imports
import {
  CreateNftDto,
  CreateProjectsInitialDto,
  ListAllProjectsDto,
  UpdateProjectCollaboratorsDto,
  UpdateProjectsDto,
  UpdateReleasesDto,
  UpdateNftDto,
  CreatePreviewDto,
  RemoveApplicationsDto,
  CreateReleaseInputDto,
  CreateNftInputDto,
  UpdateProjectsInputDto,
} from './dto';
import { AddCommentDto } from './dto/addComent.dto';
// Services Imports
import { ProjectsService } from './projects.service';
import {
  ALLOWED_IMAGE_MIMETYPES,
  DEFAULT_IMAGE_FILE_REDIS_CACHE_TTL,
  DEFAULT_IMAGE_FILE_SIZE_LIMIT,
} from './utils/consts';
import { ImageFileType, TransportImageType } from './utils/types';
import fetch from 'node-fetch';
import { AttachLyricsDto } from './dto/attachLyrics.dto';
import { AddApplicationDto } from './dto/addApplication.dto';
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
import { ProjectResponseDto } from './dto/definitions/projectResponse.dto';
import { ReleaseResponseDto } from './dto/definitions/releaseResponse.dto';
import { verify } from 'jsonwebtoken';
import {
  ResourceAuthGuard,
  ResourceRoles,
  ResourceType,
} from './guards/resource-auth.guard';
import { ProjectReleasesService } from './services/projectReleases.service';
import { ProjectNftsService } from './services/projectNfts.service';
import { LyricsService } from './services/lyrics.service';
import { ProjectGetterService } from './services/projectGetter.service';
import { TrackResponseDto } from './dto/definitions/trackResponse.dto';
import { ProjectTracksService } from './services/projectTracks.service';
import mongoose from 'mongoose';
import { Features } from '../decorators/features.decorator';
import { FeatureValidationGuard } from '../guards/feature-validation.guard';
const ObjectId = mongoose.Types.ObjectId

@Controller('projects')
@UseInterceptors(LoggingInterceptor)
@ApiTags('Projects')
@ApiBearerAuth()
export class ProjectsController {
  private readonly logger = new Logger('Project Controller');

  constructor(
    private readonly projectsService: ProjectsService,
    @InjectRedis() private readonly redis: Redis,
    private projectReleasesService: ProjectReleasesService,
    private projectNftsService: ProjectNftsService,
    private lyricsService: LyricsService,
    private projectGetterService: ProjectGetterService,
    private projectTracksService: ProjectTracksService,
  ) { }

  /**
   * Receive request HTTP POST and send message to service create project
   * @param createProjectsDto Information to create projects
   * @returns New Project
   */
  @UseGuards(
    JwtAuthGuard,
    ResourceAuthGuard(ResourceType.Project, ResourceRoles.EDITORS),
    FeatureValidationGuard
  )
  @Features([
    { featureKey: 'storage' }
  ])
  @Post()
  // @UseInterceptors(
  //   FileInterceptor('artwork', {
  //     limits: {
  //       files: 1,
  //       fileSize: DEFAULT_IMAGE_FILE_SIZE_LIMIT,
  //     },
  //     fileFilter: (_, file, cb) => {
  //       if (!file) {
  //         cb(new Error('File is undefined'), false);
  //       }
  //       //Check for the mime type
  //       if (ALLOWED_IMAGE_MIMETYPES.indexOf(file.mimetype) == -1) {
  //         cb(new Error('Invalid file type'), false);
  //       }
  //       return cb(null, true);
  //     },
  //   }),
  // )
  @ApiOperation({ summary: 'Create a new project.' })
  @ApiOkResponse({
    description: 'Returns the project with the given id',
    type: ProjectResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async create(
    // @UploadedFile() artwork: ImageFileType,
    @Param('owner') owner: string,
    @Body() createProjectsDto: CreateProjectsInitialDto,
    @Req() req: any
  ) {
    createProjectsDto.user = owner;
    let { artwork } = req.files
    let file;
    if (artwork && artwork[0]) {
      file = artwork[0]
      artwork = artwork[0]
    }
    //Add file infos to the project data
    const projectData = {
      ...createProjectsDto,
      file: null,
      split: createProjectsDto.split ? parseFloat(createProjectsDto.split) : 0,
    };

    if (file || createProjectsDto.artworkUrl) {
      //Add file infos if exists
      //Add the file info to the redis
      const fileCacheKey =
        createProjectsDto.name.trim().replace(/\s/g, '') +
        '_image_' +
        owner +
        '_' +
        Date.now();

      let buffer = file?.buffer;

      const transferImageObj: TransportImageType = {
        fileCacheKey: fileCacheKey,
        mimetype: file?.mimetype,
        size: file?.size,
      };

      if (createProjectsDto.artworkUrl) {
        const blob: any = await fetch(createProjectsDto.artworkUrl).then(
          (r: any) => r.blob(),
        );
        buffer = Buffer.from(await blob.arrayBuffer());
        transferImageObj.mimetype = blob.type;
        transferImageObj.size = blob.size;
        delete projectData.artworkUrl;
      }

      //Save to the redis
      try {
        await this.redis.setBuffer(
          fileCacheKey,
          buffer,
          'EX',
          DEFAULT_IMAGE_FILE_REDIS_CACHE_TTL,
        );
      } catch (error) {
        throw 'Error saving file on cache';
      }

      projectData.file = transferImageObj;
    }

    return this.projectsService.create(projectData);
  }

  /**
   * Receive request HTTP PUT and send message to service update project
   * @param id Project Id who will updated
   * @param updateProjectsDto Information to update projects
   * @returns Updated Project
   */
  @UseGuards(
    JwtAuthGuard,
    ResourceAuthGuard(ResourceType.Project, ResourceRoles.EDITORS),
    FeatureValidationGuard
  )
  @Features([
    { featureKey: 'storage' }
  ])
  @Put(':projectId')
  // @UseInterceptors(
  //   FileFieldsInterceptor(
  //     [
  //       { name: 'artwork', maxCount: 1 },
  //       { name: 'coverImage', maxCount: 1 },
  //     ],
  //     {
  //       limits: {
  //         files: 1,
  //         fileSize: DEFAULT_IMAGE_FILE_SIZE_LIMIT,
  //       },
  //       fileFilter: (_, file, cb) => {
  //         //Since artwork file is not required on update, if file is missing do nothing
  //         if (!file) {
  //           return cb(null, true);
  //         }
  //         //Check for the mime type
  //         if (ALLOWED_IMAGE_MIMETYPES.indexOf(file.mimetype) == -1) {
  //           cb(new Error('Invalid file type'), false);
  //         }
  //         return cb(null, true);
  //       },
  //     },
  //   ),
  // )
  @ApiOperation({ summary: 'Update a project' })
  @ApiOkResponse({
    description: 'Returns the updated project',
    type: ProjectResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  async update(
    @Param('owner') owner: string,
    @Param('projectId') id: string,
    // @UploadedFiles()
    // files: {
    //   artwork: ImageFileType[];
    //   coverImage: ImageFileType[];
    // },
    @Body() updateProjectsDto: UpdateProjectsInputDto,
    @Req() req: any
  ) {
    //Add file infos to the project data

    const projectData: UpdateProjectsDto = {
      ...updateProjectsDto,
      file: null,
      coverImage: null,
      split: parseInt(updateProjectsDto.split) || undefined,
      emptyCollaborators: !!updateProjectsDto.emptyCollaborators,
    };

    if (typeof projectData.isPublic === 'string') {
      if (projectData.isPublic === 'true') {
        projectData.isPublic = true;
      } else {
        projectData.isPublic = false;
      }
    }

    const { artwork, coverImage } = req.files;

    if (artwork && artwork[0]) {
      //Add the file info to the redis
      const fileCacheKey = id + '_image_' + owner + '_' + Date.now();

      //Save to the redis
      try {
        await this.redis.setBuffer(
          fileCacheKey,
          artwork[0].buffer,
          'EX',
          DEFAULT_IMAGE_FILE_REDIS_CACHE_TTL,
        );
      } catch (error) {
        throw 'Error saving file on cache';
      }

      const transferImageObj: TransportImageType = {
        mimetype: artwork[0].mimetype,
        fileCacheKey: fileCacheKey,
        size: artwork[0].size,
      };

      projectData.file = transferImageObj;
    }

    if (coverImage && coverImage[0]) {
      //Add the file info to the redis
      const fileCacheKey = id + '_cover_' + owner + '_' + Date.now();

      //Save to the redis
      try {
        await this.redis.setBuffer(
          fileCacheKey,
          coverImage[0].buffer,
          'EX',
          DEFAULT_IMAGE_FILE_REDIS_CACHE_TTL,
        );
      } catch (error) {
        throw 'Error saving cover file on cache';
      }

      const transferImageObj: TransportImageType = {
        mimetype: coverImage[0].mimetype,
        fileCacheKey: fileCacheKey,
        size: coverImage[0].size,
      };

      projectData.coverImage = transferImageObj;
    }

    return this.projectsService.update({
      owner,
      projectId: id,
      updateProjectsDto: projectData,
    });
  }

  /**
   * Receive request HTTP PUT and send message to service update collaborators project
   * @param {string} id Project Id who will updated
   * @param {UpdateProjectCollaboratorsDto} updateProjectCollaboratorsDto Information to update collaborators project
   * @returns Updated Project
   */
  @UseGuards(
    JwtAuthGuard,
    ResourceAuthGuard(ResourceType.Project, ResourceRoles.PRODUCERS),
  )
  @Put(':projectId/collaborators')
  @ApiOperation({ summary: 'Update project collaborators' })
  @ApiOkResponse({
    description: 'Returns the updated project',
    type: ProjectResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  async updateCollaborators(
    @Param('owner') owner: string,
    @Param('projectId') id: string,
    @Body() updateProjectCollaboratorsDto: UpdateProjectCollaboratorsDto,
  ) {
    return this.projectsService.updateCollaborators({
      owner,
      id,
      ...updateProjectCollaboratorsDto,
    });
  }

  /**
   * Receive request HTTP Delete and send message remove project
   * @param id Project id who will deleted
   * @returns
   */
  @UseGuards(
    JwtAuthGuard,
    ResourceAuthGuard(ResourceType.Project, ResourceRoles.OWNERS),
  )
  @Delete(':projectId')
  @ApiOperation({ summary: 'Delete a project' })
  @ApiOkResponse({ description: 'Success with nothing on response' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  delete(@Param('projectId') id: string) {
    return this.projectsService.delete(id);
  }

  /**
   * Receive request HTTP GET and send message to get all public projects
   * @returns All public projects
   */
  @UseGuards(JwtAuthGuard)
  @Get('public')
  @ApiOperation({ summary: 'Get all projects' })
  @ApiOkResponse({
    description: 'Returns all public projects',
    type: [ProjectResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getAll(@Query() listAllProjectsDto: ListAllProjectsDto) {
    return this.projectGetterService.getAllPublicProjects({
      ...listAllProjectsDto,
    });
  }

  /**
   * Receive request HTTP GET and send message to get project
   * @param projectId Project id
   * @returns Projects
   */
  @Get(':projectId')
  @ApiOperation({ summary: 'Get a project' })
  @ApiOkResponse({
    description: 'Returns the project',
    type: ProjectResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  getProjects(
    @Headers('authorization') token: string,
    @Param('projectId') projectId: string,
  ) {
    // attached initiating userId to payload as 'owner'
    let owner = '';
    if (token) {
      const verified = verify(
        token.split(' ')[1],
        process.env.SECRET_KEY,
      ) as any;
      const { sub } = verified || {};
      owner = sub;
    }

    return this.projectGetterService.getProject({
      projectId,
      owner,
    });
  }

  /**
   * Receive request HTTP GET and send message to get project
   * @param projectId Project id
   * @returns Projects
   */
  @Get('getProjectDetail/:projectId')
  @ApiOperation({ summary: 'Get a project' })
  @ApiOkResponse({
    description: 'Returns the project',
    type: ProjectResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  getProjectDetail(
    @Headers('authorization') token: string,
    @Param('projectId') projectId: string,
    @Query('nftId') nftId: string,
    @Query('message') message: string,
    @Query('signature') signature: string,
    @Query('includeReleases') includeReleases: string,
    @Query('includeTracks') includeTracks: string,
  ) {
    // attached initiating userId to payload as 'owner'
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

    return this.projectGetterService.getProjectDetail({
      projectId,
      owner,
      includeReleases,
      includeTracks,
      ...(shouldVerifyTokenOwnership ? { verifyTokenOwnershipDto } : {}),
    });
  }

  /**
   * Get tracks which are part of the project
   * @param projectId project id
   * @returns tracks
   */
  @Get('getTracksByProjectId/:projectId')
  @ApiOperation({ summary: 'Get tracks' })
  @ApiOkResponse({
    description: 'Returns the project',
    type: TrackResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Tracks not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  getTracksByProjectId(
    @Param('projectId') projectId: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
  ) {
    return this.projectTracksService.getProjectTracks({ projectId, options: {}, query: { startDate, endDate, limit, page } });
  }

  /**
   * Receive request HTTP GET and send message to get all projects
   * @param userId User id owner projects
   * @returns All projects from user
   */
  @UseGuards(
    JwtAuthGuard,
    ResourceAuthGuard(ResourceType.Project, ResourceRoles.VIEWERS),
  )
  @Get('/users/:id')
  @ApiOperation({ summary: 'Get all projects from user' })
  @ApiNotFoundResponse({ description: 'User not found' })
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
  getAllFromUser(
    @Param('id') userId: string,
    @Query('visibility') visibility: 'all' | 'public' | 'private' = 'all',
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('onlyOwner') onlyOwner?: boolean | string,
  ) {
    Logger.log('userId', userId);
    return this.projectGetterService.getAllFromUser({
      userId,
      visibility,
      onlyOwner,
      filter: { startDate, endDate, limit, page },
      search,
    });
  }

  /**
   * Receive request HTTP POST and send message to create NFT Control
   * @param projectId Project id that belongs to NFT
   * @returns NFT document
   */
  @UseGuards(JwtAuthGuard, ResourceAuthGuard(ResourceType.Project))
  @Post(':id/nft')
  // @UseInterceptors(
  //   FileInterceptor('file', {
  //     limits: {
  //       files: 1,
  //       fileSize: DEFAULT_IMAGE_FILE_SIZE_LIMIT,
  //     },
  //     fileFilter: (_, file, cb) => {
  //       if (!file) {
  //         cb(new Error('File is undefined'), false);
  //       }
  //       //Check for the mime type
  //       if (ALLOWED_IMAGE_MIMETYPES.indexOf(file.mimetype) == -1) {
  //         cb(new Error('Invalid file type'), false);
  //       }
  //       return cb(null, true);
  //     },
  //   }),
  // )

  @ApiOperation({ summary: 'Create NFT' })
  @ApiOkResponse({ description: 'Returns the NFT document' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async createNft(
    // @UploadedFile() file: ImageFileType,
    @Param('projectId') projectId: string,
    @Param('owner') owner: string,
    @Body() createNftDto: CreateNftInputDto,
  ) {
    //Add file infos to the project data
    createNftDto.contracts.forEach((el) => {
      el.user = new ObjectId(el.user)
      el.accepted = Boolean(el.accepted)
      el.split = Number(el.split)
    })

    const createNftDtoWithFile: CreateNftDto = {
      user: undefined,
      title: undefined,
      initialSupply: undefined,
      // file: undefined,
      project: undefined,
      description: undefined,
      artworkUrl: undefined,
      artworkExension: undefined,
      wallet: undefined,
      transactionHash: undefined,
      tokenUri: undefined,
      ...createNftDto,
    };

    // if (file) {
    //   //Add file infos if exists
    //   //Add the file info to the redis
    //   const fileCacheKey =
    //     createNftDto.title.trim().replace(/\s/g, '') +
    //     '_nft_image_' +
    //     owner +
    //     '_' +
    //     Date.now();

    //   const buffer = file?.buffer;

    //   const transferImageObj: TransportImageType = {
    //     fileCacheKey: fileCacheKey,
    //     mimetype: file?.mimetype,
    //     size: file?.size,
    //   };

    //   //Save to the redis
    //   try {
    //     await this.redis.setBuffer(
    //       fileCacheKey,
    //       buffer,
    //       'EX',
    //       DEFAULT_IMAGE_FILE_REDIS_CACHE_TTL,
    //     );
    //   } catch (error) {
    //     throw 'Error saving file on cache';
    //   }

    //   createNftDtoWithFile.file = transferImageObj;
    // }

    return this.projectNftsService.createNft({
      id: projectId,
      createNftDto: createNftDtoWithFile,
    });
  }

  @UseGuards(JwtAuthGuard, ResourceAuthGuard(ResourceType.Project))
  @Post('/createPreview')
  @ApiOperation({ summary: 'Creates Track Preview' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  createPreview(
    @Param('owner') owner: string,
    @Body() createPreviewDto: CreatePreviewDto,
  ) {
    return this.projectsService.createPreview({
      owner,
      createPreviewDto,
    });
  }

  /**
   * Receive request HTTP GET and send message to get project nfts
   * @param projectId Project id
   * @returns Projects
   */
  @Get('getProjectNfts/:projectId')
  @ApiOperation({ summary: 'Get all nfts associated with a project' })
  @ApiOkResponse({
    description: 'Returns the project',
    type: ProjectResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  getProjectNfts(
    @Headers('authorization') token: string,
    @Param('projectId') projectId: string,
  ) {
    // attached initiating userId to payload as 'owner'
    let owner = '';
    if (token) {
      const verified = verify(
        token.split(' ')[1],
        process.env.SECRET_KEY,
      ) as any;
      const { sub } = verified || {};
      owner = sub;
    }

    return this.projectNftsService.getProjectNfts({
      projectId,
      owner,
    });
  }

  /**
   * Receive request HTTP POST and send message to create NFT Control
   * @param projectId Project id that belongs to NFT
   * @returns NFT document
   */
  @UseGuards(JwtAuthGuard, ResourceAuthGuard(ResourceType.Project))
  @Post('nft/:nftId')
  @ApiOperation({ summary: 'Update NFT' })
  @ApiOkResponse({ description: 'Returns the NFT document' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  updateNft(
    @Param('nftId') nftId: string,
    @Param('owner') owner: string,
    @Body() updateNftDto: UpdateNftDto,
  ) {
    return this.projectNftsService.updateNft({
      owner,
      nftId,
      updateNftDto,
    });
  }

  /**
   * Receive request HTTP POST and send message to create NFT Control
   * @param projectId Project id that belongs to NFT
   * @returns NFT document
   */
  @UseGuards(JwtAuthGuard, ResourceAuthGuard(ResourceType.Project))
  @Get('/nft/release/:id')
  @ApiOperation({ summary: 'Create NFT' })
  @ApiOkResponse({ description: 'Returns the NFT document' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  getNftByRelease(
    @Param('id') releaseId: string,
    @Param('owner') owner: string,
  ) {
    return this.projectNftsService.getNftByRelease({
      owner,
      releaseId,
    });
  }

  /**
   * Receive request HTTP POST and send message to create release
   * @param projectId Project id that belongs release
   * @returns NFT document
   */
  @UseGuards(
    JwtAuthGuard,
    ResourceAuthGuard(ResourceType.Project, ResourceRoles.PRODUCERS),
  )
  @Post(':projectId/releases')
  @ApiOperation({ summary: 'Create release' })
  @ApiOkResponse({
    description: 'Returns the release document',
    type: ReleaseResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  createRelease(
    @Param('projectId') projectId: string,
    @Param('owner') owner: string,
    @Body() createReleasesDto: CreateReleaseInputDto,
  ) {
    return this.projectReleasesService.createRelease({
      owner,
      id: projectId,
      createReleasesDto,
    });
  }

  /**
   * Receive request HTTP Put and send message to update release
   * @param releaseId Release id
   * @returns Release document
   */
  @UseGuards(
    JwtAuthGuard,
    ResourceAuthGuard(ResourceType.Release, ResourceRoles.PRODUCERS),
  )
  @Put('releases/:id')
  @ApiOperation({ summary: 'Update release' })
  @ApiOkResponse({
    description: 'Returns the updated release document',
    type: ReleaseResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Release not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  updateRelease(
    @Param('id') releaseId: string,
    @Param('owner') owner: string,
    @Body() updateReleaseDto: UpdateReleasesDto,
  ) {
    return this.projectReleasesService.updateRelease({
      owner,
      id: releaseId,
      updateReleaseDto,
    });
  }

  /**
   * Receive request HTTP Put and send message to wallet address for release split
   * @param releaseId Release id
   */
  @UseGuards(
    JwtAuthGuard,
    ResourceAuthGuard(ResourceType.Release, ResourceRoles.ALL_MEMBERS),
  )
  @Put('releases/updateWalletAddressOnSplit/:releaseId')
  @ApiOperation({ summary: 'Update wallet address for release split' })
  @ApiOkResponse({
    description: 'Returns the updated release document',
  })
  @ApiNotFoundResponse({ description: 'Release not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  updateWalletAddressOnSplit(
    @Param('releaseId') releaseId: string,
    @Param('owner') owner: string,
    @Body() data: { address: string },
  ) {
    return this.projectReleasesService.updateWalletAddressOnReleaseSplit({
      owner,
      id: releaseId,
      data,
    });
  }

  /**
   * Receive request HTTP Put and send message to update release
   * @param releaseId Release id
   * @returns Release document
   */
  @UseGuards(
    JwtAuthGuard,
    ResourceAuthGuard(ResourceType.Release, ResourceRoles.OWNERS),
  )
  @Delete('releases/:releaseId')
  @ApiOperation({ summary: 'Delete release' })
  @ApiOkResponse({ description: 'Success with nothing on response' })
  @ApiNotFoundResponse({ description: 'Release not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  removeReleaseById(
    @Param('releaseId') releaseId: string,
    @Param('owner') owner: string,
  ) {
    return this.projectReleasesService.removeReleaseById({
      owner,
      id: releaseId,
    });
  }

  /**
   * Receive request HTTP Get and send message to get release by id
   * @param releaseId Release id
   * @returns Release informations
   */
  @UseGuards(JwtAuthGuard, ResourceAuthGuard(ResourceType.Release))
  @Get('releases/:releaseId')
  @ApiOperation({ summary: 'Get release by id' })
  @ApiOkResponse({
    description: 'Returns the release document',
    type: ReleaseResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Release not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  getReleaseById(
    @Param('releaseId') releaseId: string,
    @Param('owner') owner: string,
  ) {
    return this.projectReleasesService.getReleaseById({
      owner,
      releaseId,
    });
  }

  /**
   * Receive request HTTP Get and send message to get release by id
   * @param projectId Project id
   * @returns Release informations
   */
  @UseGuards(JwtAuthGuard, ResourceAuthGuard(ResourceType.Release))
  @Get(':projectId/releases')
  @ApiOperation({ summary: 'Get all releases from project' })
  @ApiOkResponse({
    description: 'Returns project releases',
    type: [ReleaseResponseDto],
  })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  getReleasesByProject(@Param('projectId') projectId: string) {
    return this.projectReleasesService.getReleasesByProject(projectId);
  }

  @UseGuards(
    JwtAuthGuard,
    ResourceAuthGuard(ResourceType.Project, ResourceRoles.EDITORS),
  )
  @Post(':projectId/comment')
  @ApiOperation({ summary: 'Create comment' })
  @ApiOkResponse({ description: 'Returns the comment activity' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  createComment(
    @Param('projectId') projectId: string,
    @Param('owner') owner: string,
    @Body() createCommentDto: AddCommentDto,
  ) {
    return this.projectsService.addComment({
      owner,
      id: projectId,
      comment: createCommentDto.comment,
    });
  }

  @UseGuards(
    JwtAuthGuard,
    ResourceAuthGuard(ResourceType.Project, ResourceRoles.EDITORS),
  )
  @Patch(':projectId/lyrics')
  @ApiOperation({ summary: 'Update lyrics' })
  @ApiOkResponse({ description: 'Returns the lyrics activity' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  attachLyrics(
    @Param('projectId') projectId: string,
    @Param('owner') owner: string,
    @Body() attachLyricsDto: AttachLyricsDto,
  ) {
    const lyrics = attachLyricsDto.lyrics.map((lyricsObj) =>
      lyricsObj.id ? lyricsObj.id : lyricsObj,
    );

    return this.lyricsService.addLyricsToProject({
      userId: owner,
      projectId,
      lyricsObj: lyrics,
    });
  }

  /**
   * Add a application request to a project
   * @param projectId Project id
   * @param createApplicationDto A object wih the description
   */
  @UseGuards(JwtAuthGuard)
  @Post(':projectId/application')
  @ApiOperation({ summary: 'Create project application' })
  @ApiOkResponse({ description: 'Returns the application' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  createApplication(
    @Param('projectId') projectId: string,
    @Param('owner') owner: string,
    @Body() createApplicationDto: AddApplicationDto,
  ) {
    return this.projectsService.createApplication({
      userId: owner,
      projectId,
      ...createApplicationDto,
    });
  }

  /**
   * Return all applications request from a project
   * @param projectId Project id
   * @returns All request applications
   */
  @UseGuards(JwtAuthGuard, ResourceAuthGuard(ResourceType.Project))
  @Get(':projectId/applications')
  @ApiOperation({ summary: 'Get all applications from project' })
  @ApiOkResponse({ description: 'Returns project applications' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  getApplications(@Param('projectId') projectId: string) {
    return this.projectsService.getApplications(projectId);
  }

  /**
   * Delete a application request
   * @param projectId Project id
   */
  @UseGuards(
    JwtAuthGuard,
    ResourceAuthGuard(ResourceType.Project, ResourceRoles.PRODUCERS),
  )
  @Delete(':projectId/applications')
  @ApiOperation({ summary: 'Delete applications' })
  @ApiOkResponse({ description: 'Success with nothing on response' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  deleteApplication(
    @Param('projectId') projectId: string,
    @Body() removeApplicationDto: RemoveApplicationsDto,
  ) {
    return this.projectsService.deleteApplications({
      projectId,
      ...removeApplicationDto,
    });
  }
}
