import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Put,
  Req,
} from '@nestjs/common';
import { LiveStreamService } from './stream.service';
import { CreateLiveStreamDto } from './dto/create-stream.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UpdateLiveStreamDto } from './dto/update-stream.dto';
import { Features } from '../decorators/features.decorator';
import { FeatureValidationGuard } from '../guards/feature-validation.guard';

@Controller('stream')
export class LiveStreamController {
  constructor(private readonly liveStreamService: LiveStreamService) { }

  @Get('call-types')
  async getCallTypes() {
    return this.liveStreamService.getCallTypes();
  }

  @UseGuards(JwtAuthGuard)
  @Post('token/user')
  async generateUserToken(
    @Param('owner') owner: string
  ) {
    return this.liveStreamService.generateUserToken(owner);
  }

  @UseGuards(JwtAuthGuard)
  @Post('token/call')
  async generateCallToken(
    @Param('owner') owner: string,
    @Body() callTokenDto: { cids: string[] },
  ) {
    return this.liveStreamService.generateCallToken(owner, callTokenDto);
  }

  @UseGuards(JwtAuthGuard, FeatureValidationGuard)
  @Features([
    { featureKey: 'storage' }
  ])
  @Post('create')
  // @UseInterceptors(FileInterceptor('artwork'))
  async createStream(
    @Param('owner') owner: string,
    @Body() createLiveStreamDto: CreateLiveStreamDto,
    // @UploadedFile() artwork?: Express.Multer.File,
    @Req() req: any
  ) {
    let { artwork } = req.files
    if (artwork && artwork[0]) artwork = artwork[0]
    return this.liveStreamService.scheduleStream(
      owner,
      createLiveStreamDto,
      artwork,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':streamId')
  async updateStream(
    @Param('streamId') streamId: string,
    @Body() updateLiveStreamDto: UpdateLiveStreamDto,
  ) {
    return this.liveStreamService.updateStream(streamId, updateLiveStreamDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':streamId/:status')
  async updateStreamStatus(
    @Param('streamId') streamId: string,
    @Param('status') status: string,
  ) {
    return this.liveStreamService.updateStreamStatus(streamId, status);
  }

  @UseGuards(JwtAuthGuard)
  @Get('hosted')
  async getUserHostedStreams(@Param('owner') owner: string) {
    return this.liveStreamService.getUserHostedStreams(owner);
  }

  @UseGuards(JwtAuthGuard)
  @Get('public')
  async getPublicStreams(@Param('owner') owner: string) {
    return this.liveStreamService.getPublicStreams(owner);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':streamId')
  async getStream(@Param('streamId') streamId: string) {
    return this.liveStreamService.getStreamDetails(streamId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':streamId/nft-holders')
  async getNftHolders(
    @Param('streamId') streamId: string,
  ) {
    return this.liveStreamService.getNftHolders(streamId);
  }
}

