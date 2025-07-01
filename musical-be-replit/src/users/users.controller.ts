import { InjectRedis } from '@liaoliaots/nestjs-redis';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Redis } from 'ioredis';
import {
  ApiBearerAuth,
  ApiTags,
  ApiForbiddenResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LoggingInterceptor } from '../interceptors/loggin.interceptor';
import { AddPushTokenDto } from './dto/addPushToken.dto';
import { CreateCollabDto, UpdateCollabDto } from './dto/collaboration';
import { CreateCollabItemDto } from './dto/collaboration/createItem.dto';
import { UpdateCollabItemDto } from './dto/collaboration/updateItem.dto';
import { CreateUserDto } from './dto/createUser.dto';
import { CreateUserInputDto } from './dto/createUserInput.dto';
import { addFilters } from './dto/addFilters.dto';
// Dtos imports
import { FindOneUserDto } from './dto/findOneUser.dto';
import { FindUserByEmailDto } from './dto/findUserByEmail.dto';
import { AddLocalizationDto } from './dto/localization/addLocalization.dto';
import { CreatePasswordResetDto } from './dto/passwordReset/createPasswordReset.dto';
import { ResetPasswordDto } from './dto/passwordReset/resetPassword.dto';
import { RemovePushTokenDto } from './dto/removePushToken.dto';
import { SearchArtistsDto } from './dto/searchArtists.dto';
import { AddSkillDto } from './dto/addSkill.dto';
import { AddStyleDto } from './dto/style/addStyle.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { ValidateUserDto } from './dto/validateUser.dto';
import { CreateWalletAccount } from './dto/wallet/createWalletAccount.dto';
// Services Imports
import { UsersService } from './users.service';
import {
  ALLOWED_IMAGE_MIMETYPES,
  DEFAULT_IMAGE_FILE_REDIS_CACHE_TTL,
  DEFAULT_IMAGE_FILE_SIZE_LIMIT,
} from './utils/constants';
import { ImageFileType, TransportImageType } from './utils/types';
import { SkillsTypesResponseDto } from '../docs/dto/skillsTypesResponse.dto';
import { StylesResponseDto } from '../docs/dto/stylesResponse.dto';
import { UserResponseDto } from '../docs/dto/userResponse.dto';
import { ValidateResponseDto } from './dto/definitions/validateResponse.dto';
import { CollaborationResponseDto } from './dto/definitions/collaborationResponse.dto';
import {
  CityResponseDto,
  CountryResponseDto,
  DesignDto,
  LanguagesDto,
  LocationResponseDto,
  StateResponseDto,
} from './dto/definitions/locationResponse.dto';
import { ArtistsService } from './services';
import {
  ResourceAuthGuard,
  ResourceType,
  ResourceRoles,
} from './guards/resource-auth.guard';
import ServiceException from './exceptions/ServiceException';
import { ExceptionsEnum } from './utils/enums';
import { FeatureValidationGuard } from '../guards/feature-validation.guard';
import { Features } from '../decorators/features.decorator';
import { UserActivityService } from '../user-activity/user-activity.service';
import { EventTypeEnum } from '../gamificationEvent/utils/enum';
import { OtpDto } from './dto/otp.dto';

@Controller('users')
@UseInterceptors(LoggingInterceptor)
@ApiTags('Users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly artistService: ArtistsService,
    private readonly userActivityService: UserActivityService,
    @InjectRedis() private readonly redis: Redis,
  ) { }

  @Post('validate')
  @ApiOperation({
    summary: 'Validates user credentials and returns a JWT token if required',
  })
  @ApiOkResponse({ description: 'User found', type: ValidateResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  @ApiBadRequestResponse({ description: 'Invalid data type' })
  validate(@Body() validateUserDto: ValidateUserDto) {
    return this.usersService.validate(validateUserDto);
  }

  @Post()
  @ApiOperation({ summary: 'Registers a new user' })
  @ApiCreatedResponse({
    description: 'Created user',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid data type' })
  async create(
    @Body() createUserDto: CreateUserInputDto,
    // @Req() req: Request
  ) {
    // const userAgent = req.headers['user-agent'];
    // const registerDevice = this.usersService.getDeviceInformation(userAgent);

    const args: CreateUserDto = {
      ...createUserDto,
      // registerDevice,
    };

    const username = await this.usersService.checkUsername(createUserDto.username)
    if (username) {
      throw new ServiceException('The username is already taken. Please try a different one.', ExceptionsEnum.Conflict,);
    }

    return this.usersService.create(args);
  }

  @Post('confirm/:token')
  @ApiOperation({ summary: 'Confirms user account' })
  @ApiOkResponse({ description: 'Ok' })
  @ApiNotFoundResponse({ description: 'Token not found' })
  confirmAccount(@Param('token') token: string) {
    return this.usersService.confirmAccount(token);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  @ApiOperation({ summary: 'Deletes a user' })
  @ApiBearerAuth()
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOkResponse({ description: 'Ok' })
  deleteAccount(@Param('owner') owner: string) {
    return this.usersService.deleteAccount(owner);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({ description: 'The users', type: [UserResponseDto] })
  findAll(
    @Query('lang') lang: string,
    @Query('skills') skills = false,
    @Query('search') search: string,
  ) {
    return this.usersService.findAll({
      lang,
      skills,
      search,
    });
  }

  // @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiOkResponse({ description: 'User found', type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'User not found.' })
  async findOne(@Param() params: FindOneUserDto) {
    const user = await this.usersService.findOne(params.id);
    const userSubscription = await this.usersService.GetUserSubscriptions(
      params.id,
    );
    return {
      ...user,
      userSubscription,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  @ApiOperation({ summary: 'Updates a user' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'The updated user', type: UserResponseDto })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Invalid data type' })
  async update(@Param('owner') owner: string, @Body() updateUserDto: UpdateUserDto) {

    const username = await this.usersService.checkUsername(updateUserDto.username, owner)
    if (username) {
      throw new ServiceException('The username is already taken. Please try a different one.', ExceptionsEnum.Conflict);
    }

    return this.usersService.update(owner, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('image/profile')
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
  //       if (!ALLOWED_IMAGE_MIMETYPES.includes(file.mimetype)) {
  //         cb(new Error('Invalid file type'), false);
  //       }
  //       return cb(null, true);
  //     },
  //   }),
  // )
  @ApiOperation({ summary: 'Updates a user profile image' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Updated user with image',
    type: UserResponseDto,
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Invalid data type' })
  async updateProfileImage(
    @Param('owner') owner: string,
    // @UploadedFile() file: ImageFileType,
    @Req() req: any
  ) {
    let { file } = req.files

    if (file && file[0]) {
      file = file[0]
      //Add the file info to the redis
      const fileCacheKey = 'update_image_' + owner + '_' + Date.now();

      //Save to the redis
      try {
        await this.redis.setBuffer(
          fileCacheKey,
          file.buffer,
          'EX',
          DEFAULT_IMAGE_FILE_REDIS_CACHE_TTL,
        );
      } catch (error) {
        throw 'Error saving file on cache';
      }

      const imageTransportObj: TransportImageType = {
        mimetype: file.mimetype,
        fileCacheKey: fileCacheKey,
        size: file.size,
      };

      return this.usersService.updateProfileImage({
        id: owner,
        file: imageTransportObj,
      });
    } else {
      return await this.usersService.deleteProfileImage(owner);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('image/cover')
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

  //       if (!ALLOWED_IMAGE_MIMETYPES.includes(file.mimetype)) {
  //         cb(new Error('Invalid file type'), false);
  //       }
  //       return cb(null, true);
  //     },
  //   }),
  // )
  @ApiOperation({ summary: 'Updates a user cover image' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Updated user with image',
    type: UserResponseDto,
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Invalid data type' })
  async updateCoverImage(
    @Param('owner') owner: string,
    // @UploadedFile() file: ImageFileType,
    @Req() req: any
  ) {
    let { file } = req.files
    if (file && file[0]) file = file[0]
    //Add the file info to the redis
    const fileCacheKey = 'update_image_' + owner + '_' + Date.now();

    //Save to the redis
    try {
      await this.redis.setBuffer(
        fileCacheKey,
        file.buffer,
        'EX',
        DEFAULT_IMAGE_FILE_REDIS_CACHE_TTL,
      );
    } catch (error) {
      throw 'Error saving file on cache';
    }

    const imageTransportObj: TransportImageType = {
      mimetype: file.mimetype,
      fileCacheKey: fileCacheKey,
      size: file.size,
    };

    return this.usersService.updateCoverImage({
      id: owner,
      file: imageTransportObj,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put('skills')
  @ApiOperation({ summary: 'Updates a user skills' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'The updated user', type: UserResponseDto })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Invalid data type' })
  addSkill(@Param('owner') owner: string, @Body() addSkill: AddSkillDto) {
    return this.usersService.addSkill({
      id: owner,
      skill: addSkill,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('skills/:skill_type')
  @ApiOperation({ summary: 'Deletes a user skill' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'The updated user', type: UserResponseDto })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  removeSkill(
    @Param('owner') owner: string,
    @Param('skill_type') type: string,
  ) {
    return this.usersService.removeSkill({
      id: owner,
      skill_type: type,
    });
  }

  @Get('skills/:id/:lang')
  @ApiOperation({ summary: 'Gets a user skills' })
  @ApiOkResponse({
    description: 'Returns skills',
    type: [SkillsTypesResponseDto],
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  getSkills(@Param('id') user: string, @Param('lang') lang: string) {
    return this.usersService.getUserSkills({
      id: user,
      lang: lang,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put('styles')
  @ApiOperation({ summary: 'Updates a user styles' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns the styles',
    type: [StylesResponseDto],
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Invalid data type' })
  addStyle(@Param('owner') owner: string, @Body() addStyle: AddStyleDto) {
    return this.usersService.addStyle({
      id: owner,
      addStyleDto: addStyle,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('styles/:styleId')
  @ApiOperation({ summary: 'Deletes a user style' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'The updated user', type: UserResponseDto })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  removeStyle(
    @Param('owner') owner: string,
    @Param('styleId') styleId: string,
  ) {
    return this.usersService.removeStyle({
      id: owner,
      styleId,
    });
  }

  @Get('styles/:id/:lang')
  @ApiOperation({ summary: 'Gets a user styles' })
  @ApiOkResponse({
    description: 'Returns styles',
    type: [StylesResponseDto],
  })
  getStyles(@Param('id') user: string, @Param('lang') lang: string) {
    return this.usersService.getUserStyles({
      id: user,
      lang: lang,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('collaborations/availability')
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'The collaboration availability has been successfully created',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Invalid data type' })
  createCollabAvailability(
    @Param('owner') owner: string,
    @Body() createCollabItemDto: CreateCollabItemDto,
  ) {
    return this.usersService.createCollabAvailability({
      id: owner,
      data: createCollabItemDto,
    });
  }

  @Get(':id/collaborations/availability')
  @ApiOperation({ summary: 'Gets collaborations availability' })
  @ApiOkResponse({
    description: 'Returns collaborations availability',
    type: [CollaborationResponseDto],
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  findCollabAvailability(@Param('id') id: string) {
    return this.usersService.findCollabAvailability(id);
  }

  /**
   * Send message to update a collaboration availability
   * @param user User id
   * @param updateCollabItemDto Informations to update a collab availabitlity
   * @returns The collaboration availability informations
   */

  @UseGuards(JwtAuthGuard)
  @Put('collaborations/availability')
  @ApiOperation({ summary: 'Updates a collaboration availability' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns updated collaboration',
    type: CollaborationResponseDto,
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Invalid data type' })
  updateCollabAvailability(
    @Param('owner') owner: string,
    @Body() updateCollabItemDto: UpdateCollabItemDto[],
  ) {
    return this.usersService.updateCollabAvailability({
      id: owner,
      items: updateCollabItemDto,
    });
  }

  @UseGuards(JwtAuthGuard, FeatureValidationGuard)
  @Features([
    { featureKey: 'storage' }
  ])
  @Post('collaborations/opportunities')
  // @UseInterceptors(
  //   FileInterceptor('artwork', {
  //     limits: {
  //       files: 1,
  //       fileSize: DEFAULT_IMAGE_FILE_SIZE_LIMIT,
  //     },
  //     fileFilter: (_, file, cb) => {
  //       //Check for the mime type
  //       if (file && !ALLOWED_IMAGE_MIMETYPES.includes(file.mimetype)) {
  //         cb(new Error('Invalid file type'), false);
  //       }

  //       return cb(null, true);
  //     },
  //   }),
  // )
  @ApiOperation({ summary: 'Creates a user collaboration opportunity' })
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'The collaboration opportunity has been successfully created',
    type: CollaborationResponseDto,
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Invalid data type' })
  async createCollab(
    // @UploadedFile() artwork: ImageFileType,
    @Param('owner') owner: string,
    @Body() createCollabDto: CreateCollabDto,
    @Req() req: any
  ) {
    const collabData = {
      ...createCollabDto,
      artwork: null,
    };

    let { artwork } = req.files
    if (artwork && artwork[0]) {
      artwork = artwork[0]
      // Add file infos if exists
      // Add the file info to the redis
      const slugTitle = collabData.title.trim().replace(/\s/g, '');
      const fileCacheKey = `${slugTitle}_image_${owner}_${Date.now()}`;

      //Save to the redis
      try {
        await this.redis.setBuffer(
          fileCacheKey,
          artwork.buffer,
          'EX',
          DEFAULT_IMAGE_FILE_REDIS_CACHE_TTL,
        );
      } catch (error) {
        throw 'Error saving file on cache';
      }

      const transferImageObj: TransportImageType = {
        mimetype: artwork.mimetype,
        fileCacheKey: fileCacheKey,
        size: artwork.size,
      };

      collabData.artwork = transferImageObj;
    }

    return this.usersService.createCollab({
      id: owner,
      createCollabDto: collabData,
    });
  }

  @Post('collaborations/opportunities/:collabId/project')
  @UseGuards(JwtAuthGuard, ResourceAuthGuard(ResourceType.Collaborations))
  @ApiOperation({
    summary: 'Creates a project from a collaboration opportunity',
  })
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Returns the project',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  createProjectFromCollaboration(@Param('collabId') collabId: string) {
    return this.usersService.createProjectFromCollaboration(collabId);
  }

  @Get(':id/collaborations/opportunities/:lang')
  @ApiOperation({ summary: 'Gets collaboration opportunities' })
  @ApiOkResponse({
    description: 'Returns collaboration opportunities',
    type: [CollaborationResponseDto],
  })
  findCollab(@Param('id') userId: string) {
    return this.usersService.findAllCollab({
      userId,
      filters: {},
    });
  }

  @Get('/collaborations/opportunities/:lang')
  @ApiOperation({ summary: 'Gets all collaboration opportunities' })
  @ApiOkResponse({
    description: 'Returns all collaboration opportunities',
    type: [CollaborationResponseDto],
  })
  findAllCollab(
    @Param('lang') lang: string,
    @Query(new ValidationPipe({ transform: true })) filters: addFilters,
  ) {
    return this.usersService.findAllCollab({
      lang,
      offSet: filters.offSet,
      filters: filters && {
        styles: filters.styles,
        seeking: filters.seeking,
        skillsOffered: filters.skillsOffered,
      },
      projectId: filters.projectId,
      txtFilter: filters.txtFilter,
    });
  }

  /**
   * Send message to update collaborations
   * @param params Collab Id that will be updated
   * @param updateCollabDto Collaboration information to update
   * @returns Update Collaboration
   */
  @UseGuards(
    JwtAuthGuard,
    ResourceAuthGuard(ResourceType.Collaborations, ResourceRoles.PRODUCERS),
    FeatureValidationGuard
  )
  @Features([
    { featureKey: 'storage' }
  ])
  @Put('collaborations/opportunities/:collabId')
  // @UseInterceptors(
  //   FileInterceptor('artwork', {
  //     limits: {
  //       files: 1,
  //       fileSize: DEFAULT_IMAGE_FILE_SIZE_LIMIT,
  //     },
  //     fileFilter: (_, file, cb) => {
  //       if (!file) {
  //         return cb(null, true);
  //       }

  //       //Check for the mime type
  //       if (!ALLOWED_IMAGE_MIMETYPES.includes(file.mimetype)) {
  //         cb(new Error('Invalid file type'), false);
  //       }

  //       return cb(null, true);
  //     },
  //   }),
  // )
  @ApiOperation({ summary: 'Updates a collaboration opportunity' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Updated collaboration opportunity',
    type: CollaborationResponseDto,
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Invalid data type' })
  async updateCollab(
    // @UploadedFile() artwork: ImageFileType,
    @Param('owner') owner: string,
    @Param('collabId') collabId: string,
    @Body() updateCollabDto: UpdateCollabDto,
    @Req() req: any
  ) {
    const collabData = {
      ...updateCollabDto,
      artwork: null,
    };
    let { artwork } = req.files
    if (artwork && artwork[0]) {
      artwork = artwork[0]
      // Add file infos if exists
      // Add the file info to the redis
      const slugTitle = collabData.title.trim().replace(/\s/g, '');
      const fileCacheKey = `${slugTitle}_image_${owner}_${Date.now()}`;

      //Save to the redis
      try {
        await this.redis.setBuffer(
          fileCacheKey,
          artwork.buffer,
          'EX',
          DEFAULT_IMAGE_FILE_REDIS_CACHE_TTL,
        );
      } catch (error) {
        throw 'Error saving file on cache';
      }

      const transferImageObj: TransportImageType = {
        mimetype: artwork.mimetype,
        fileCacheKey: fileCacheKey,
        size: artwork.size,
      };

      collabData.artwork = transferImageObj;
    }

    return this.usersService.updateCollab({
      owner,
      collabId,
      updateCollabDto: collabData,
    });
  }

  @UseGuards(JwtAuthGuard, ResourceAuthGuard(ResourceType.Collaborations))
  @Delete('collaborations/opportunities/:collabId')
  @ApiOperation({ summary: 'Deletes a collaboration opportunity' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Ok' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  deleteCollab(@Param('collabId') id: string) {
    return this.usersService.deleteCollab(id);
  }

  /**
   * Send message to the user service to add a localization
   * @param user User id to update the localization
   * @param addLocalizationDto City id to update the localization
   * @returns {Observable<any>} Reponse from the user service
   */
  @UseGuards(JwtAuthGuard)
  @Put('localization')
  @ApiOperation({ summary: 'Updates the user localization' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns the updated user',
    type: UserResponseDto,
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Invalid data type' })
  addLocalization(
    @Param('owner') owner: string,
    @Body() addLocalizationDto: AddLocalizationDto,
  ) {
    return this.usersService.addLocalization({
      id: owner,
      cityId: addLocalizationDto.cityId,
    });
  }

  /**
   * Send message to the user service get a localization
   * @param {string} userId User id to get the localization
   * @returns Localization of the user
   */
  @Get(':userId/localization')
  @ApiOperation({ summary: 'Gets the user localization' })
  @ApiOkResponse({
    description: 'Returns the user localization',
    type: LocationResponseDto,
  })
  getLocalization(@Param('userId') userId: string) {
    return this.usersService.getLocalization(userId);
  }

  @Get('list/countries')
  @ApiOperation({ summary: 'Gets all countries' })
  @ApiOkResponse({
    description: 'Returns all countries',
    type: [CountryResponseDto],
  })
  @ApiOkResponse({ description: 'List of countries' })
  getCountries() {
    return this.usersService.getCountries();
  }

  @Get('countries/:id/states')
  @ApiOperation({ summary: 'Gets all states of a country' })
  @ApiOkResponse({
    description: 'Returns all states of a country',
    type: [StateResponseDto],
  })
  @ApiOkResponse({ description: 'List of states' })
  getStates(@Param('id') countryId: string) {
    return this.usersService.getStates(countryId);
  }

  @Get('states/:id/cities')
  @ApiOperation({ summary: 'Gets all cities of a state' })
  @ApiOkResponse({
    description: 'Returns all cities of a state',
    type: [CityResponseDto],
  })
  @ApiOkResponse({ description: 'List of cities' })
  getCities(@Param('id') stateId: string) {
    return this.usersService.getCities(stateId);
  }

  /**
   * Send message to get all invites of the user
   * @returns Invite list
   */
  @UseGuards(JwtAuthGuard)
  @Get('list/invites')
  @ApiOperation({ summary: 'Gets all invites of the user' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'List of invites' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  getInvites(@Param('owner') userId: string) {
    return this.usersService.getInvitesByUser(userId);
  }

  /**
   * Verify is the invite is valid
   * @param inviteId Invite id to validate
   */
  @UseGuards(JwtAuthGuard)
  @Put('invites/:inviteId/validate')
  @ApiOperation({ summary: 'Validates an invite' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Ok' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  validateInvite(
    @Param('owner') id: string,
    @Param('inviteId') inviteId: string,
  ) {
    return this.usersService.validateInvite({
      id,
      inviteId,
    });
  }

  /**
   * Create new invites to user
   * @param inviteId Invite id to validate
   */
  @Post(':userId/invites')
  @ApiOperation({ summary: 'Creates an invite' })
  @ApiOkResponse({ description: 'Ok' })
  @ApiBadRequestResponse({ description: 'Invalid data type' })
  createInvites(
    @Param('userId') userId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.usersService.createInvites({
      userId,
      quantity,
    });
  }

  @Post('password/reset')
  @ApiOperation({ summary: 'Sends an email to reset the password' })
  @ApiOkResponse({ description: 'Ok' })
  @ApiBadRequestResponse({ description: 'Invalid data type' })
  async createPasswordReset(
    @Body() createPasswordResetDto: CreatePasswordResetDto,
  ) {
    return this.usersService.createPasswordReset(createPasswordResetDto);
  }

  @Patch('password/reset')
  @ApiOperation({ summary: 'Resets the password' })
  @ApiOkResponse({ description: 'Ok' })
  @ApiNotFoundResponse({ description: 'Password reset token not found' })
  @ApiBadRequestResponse({ description: 'Invalid data type' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.usersService.resetPassword(resetPasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('invites/:inviteId/send')
  @ApiOperation({ summary: 'Sends an invite' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Ok' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Invalid data type' })
  sendInvite(
    @Param('owner') id: string,
    @Param('inviteId') inviteId: string,
    @Body() sendInviteDto: { email: string },
  ) {
    return this.usersService.sendInvites({
      id,
      inviteId,
      ...sendInviteDto,
    });
  }

  @UseGuards(JwtAuthGuard, ResourceAuthGuard(ResourceType.Invites))
  @Post('invites/:inviteId/copy')
  @ApiOperation({ summary: 'Copies an invite' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Ok' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  copyInvite(@Param('owner') owner: string, @Param('inviteId') id: string) {
    return this.usersService.copyInvites({
      id,
      owner,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('search')
  @ApiOperation({ summary: 'Search users by email' })
  @ApiOkResponse({ description: 'List of users', type: [UserResponseDto] })
  @ApiBadRequestResponse({ description: 'Invalid data type' })
  findByEmail(@Body() findUserByEmailDto: FindUserByEmailDto) {
    const { email } = findUserByEmailDto;

    return this.usersService.findByEmail(email.toLocaleLowerCase());
  }

  @Get('artists/search')
  @ApiOperation({ summary: 'Search artists by name' })
  @ApiOkResponse({ description: 'Ok', type: [UserResponseDto] })
  @ApiBadRequestResponse({ description: 'Invalid data type' })
  searchArtists(
    @Query() { query, sort, skills, styles, page, limit }: SearchArtistsDto,
  ) {
    return this.artistService.findArtists({
      query: query || '',
      sort,
      skills: skills || [],
      styles: styles || [],
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('wallets')
  @ApiOperation({ summary: 'Creates a wallet' })
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Invalid data type' })
  async createWalletAccount(
    @Param('owner') owner: string,
    @Body() createWalletAccount: CreateWalletAccount,
  ) {

    const existingWallet = await this.usersService.checkWallet(createWalletAccount.addr.toLowerCase(), owner)
    if (existingWallet) {
      throw new ServiceException('The wallet address is already registered with other. Please try a different one.', ExceptionsEnum.Conflict,);
    }

    return this.usersService.createWalletAccount({
      owner,
      ...createWalletAccount,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('push_token')
  @ApiOperation({ summary: 'Creates a push token' })
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Returns the updated user',
    type: UserResponseDto,
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Invalid data type' })
  async addPushToken(
    @Param('owner')
    id: string,
    @Body() addPushTokenDto: AddPushTokenDto,
  ) {
    return this.usersService.addPushToken({
      userId: id,
      ...addPushTokenDto,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('push_token')
  @ApiOperation({ summary: 'Deletes a push token' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Returns updated user', type: UserResponseDto })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Invalid data type' })
  async removePushToken(
    @Param('owner') id: string,
    @Body() removePushTokenDto: RemovePushTokenDto,
  ) {
    return this.usersService.removePushToken({
      userId: id,
      ...removePushTokenDto,
    });
  }

  @Get('list/languages')
  @ApiOperation({ summary: 'Gets all Languages' })
  @ApiOkResponse({
    description: 'Returns all Languages',
    type: [LanguagesDto],
  })
  @ApiOkResponse({ description: 'List of Languages' })
  getLanguages() {
    return this.usersService.GetLanguages();
  }

  @Get('list/designs')
  @ApiOperation({ summary: 'Gets all designs' })
  @ApiOkResponse({
    description: 'Returns all designs',
    type: [DesignDto],
  })
  @ApiOkResponse({ description: 'List of designs' })
  getDesigns() {
    return this.usersService.GetDesigns();
  }

  // @Post('/Invite user')
  // @ApiOperation({ summary: 'Invite User' })
  // inviteUserByMail( @Body() createUserDto: CreateUserInputDto,) {
  //   return this.usersService.InviteUser(createUserDto);
  // }

  @UseGuards(JwtAuthGuard)
  @Get('storage/limit')
  @ApiOperation({ summary: 'Get the user storage usage and active storage limit' })
  @ApiOkResponse({ description: 'User storage limits' })
  async getUserStorageLimits(
    @Param('owner') owner: string
  ) {
    return await this.usersService.getUserStorageLimits(owner)
  }

  @UseGuards(JwtAuthGuard)
  @Get('storage/files')
  @ApiOperation({ summary: 'Get all the files of user' })
  @ApiOkResponse({ description: 'User files' })
  async getUserFilesList(
    @Param('owner') owner: string
  ) {

  }

  /**
   * If user unable mobile notification then give NOTEs to user
   * @returns User notification allowance
  */
  @UseGuards(JwtAuthGuard)
  @Get('/notification-allowance/:owner')
  @ApiOperation({ summary: 'Get the user notification allowance' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: '' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async getNotificationAllowance(@Param('owner') owner: string) {
    await this.userActivityService.activity(owner, EventTypeEnum.ACCEPT_MOBILE_NOTIFICATIONS)
    return true
  }

  //OTP send to user
  @UseGuards(JwtAuthGuard)
  @Post('/otp-send')
  @ApiOperation({ summary: 'Send OTP to user' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: '' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async otpSend(
    @Param('owner') owner: string,
    @Body() dto: OtpDto
  ) {
    await this.usersService.otpHandler(owner, dto)
    return true
  }
}