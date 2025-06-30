import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AyrshareService } from './ayrshare.service';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  AutoHashtagsDto,
  CreateProfileDto,
  UnlinkSocialNetworkDto,
} from './dto/ayrshare.dto';
import { JwtAuthGuard } from '@/src/guards/jwt-auth.guard';
import { FeatureValidationGuard } from '../guards/feature-validation.guard';
import { Features } from '../decorators/features.decorator';

@Controller('ayrshare')
export class AyrshareController {
  constructor(private readonly ayrshareService: AyrshareService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Create Ayrshare user profile',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  @ApiBadRequestResponse({
    description: 'Ayrshare profile for this user is already created',
  })
  async createProfile(
    @Param('owner') owner: string,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    const profile = await this.ayrshareService.createProfile(
      createProfileDto,
      owner,
    );
    return profile;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/jwt')
  @ApiOperation({
    description: 'Ayrshare generate JWT',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  async generateJWt(@Param('owner') owner: string) {
    return await this.ayrshareService.generateJWT(owner);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    description: 'Ayrshare generate JWT',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  async userProfile(@Param('owner') owner: string) {
    const { profile, ...rest } = await this.ayrshareService.userProfile(owner);
    return rest;
  }

  @UseGuards(JwtAuthGuard, FeatureValidationGuard)
  @Features([
    { featureKey: 'social_management_suite' }
  ])
  @Delete()
  @ApiOperation({
    description: 'Ayrshare Unlink social network',
  })
  async unlinkSocialNetwork(
    @Param('owner') owner: string,
    @Query() query: UnlinkSocialNetworkDto,
  ) {
    const { platform } = query;
    return await this.ayrshareService.unlinkSocialNetwork(owner, platform);
  }

  @UseGuards(JwtAuthGuard, FeatureValidationGuard)
  @Features([
    { featureKey: 'social_management_suite' }
  ])
  @Post('/hashtags')
  @ApiOperation({
    description: 'Create auto hashtags for the content using AI',
  })
  async autoHashtags(
    @Param('owner') owner: string,
    @Body() autoHashtagsDto: AutoHashtagsDto,
  ) {
    return this.ayrshareService.autoHastags(owner, autoHashtagsDto);
  }

  @UseGuards(JwtAuthGuard, FeatureValidationGuard)
  @Features([
    { featureKey: 'social_management_suite' }
  ])
  @Get('/dashboard')
  @ApiOperation({
    description: 'Social post data',
  })
  async socialData(
    @Param('owner') owner: string,
  ) {
    return this.ayrshareService.campaignsData(owner);
  }
}