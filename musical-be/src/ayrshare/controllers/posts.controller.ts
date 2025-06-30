import { JwtAuthGuard } from '@/src/guards/jwt-auth.guard';
import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { PostsService } from '../services/posts.services';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { PublishPostDto, GetScheduledPostsDto } from '../dto/posts.dto';
import { FeatureValidationGuard } from '@/src/guards/feature-validation.guard';
import { Features } from '@/src/decorators/features.decorator';
import { ResizePostDto, SentimentsDto } from '../dto/maxPack.dto';

@Controller('post')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  @UseGuards(JwtAuthGuard, FeatureValidationGuard)
  @Features([
    { featureKey: 'social_management_suite' }
  ])
  @Post()
  @ApiOperation({
    description: 'Publish a post for a selected social network',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  async publishPost(
    @Param('owner') owner: string,
    @Body() publishPostDto: PublishPostDto,
    @Req() req: any
  ) {
    return await this.postsService.publishPost(owner, publishPostDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    description: 'Get all posts',
  })
  @ApiOkResponse({
    description: 'success',
  })
  async getPosts(@Param('owner') owner: string) {
    return await this.postsService.getPosts(owner);
  }

  @UseGuards(JwtAuthGuard)
  @Get('scheduled')
  @ApiOperation({
    description: 'Get all scheduled posts with optional date filters',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  async getScheduledPosts(
    @Param('owner') owner: string,
    @Query() filters: GetScheduledPostsDto,
  ) {
    return await this.postsService.getScheduledPosts(owner, filters);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  @ApiOperation({
    description: 'Get post history with optional filters',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  async getPostHistory(
    @Param('owner') owner: string,
    @Query('status') status?: string,
    @Query('lastDays') lastDays?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: string,
    @Query('platform') platform?: string,
  ) {
    return await this.postsService.getPostHistory(owner, {
      status,
      lastDays,
      limit,
      type,
      platform,
    });
  }


  //Resizing of Image and videos
  @UseGuards(JwtAuthGuard, FeatureValidationGuard)
  @Features([
    { featureKey: 'social_management_suite' }
  ])
  @Post('resize')
  @ApiOperation({
    description: 'Resizing of Image and videos',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  async resizePost(
    @Param('owner') owner: string,
    @Body() resizePostDto: ResizePostDto,
  ) {
    return await this.postsService.resizePost(owner, resizePostDto);
  }


  //Sentiment Analysis of a post
  @UseGuards(JwtAuthGuard, FeatureValidationGuard)
  @Features([
    { featureKey: 'social_management_suite' }
  ])
  @Post('sentiment-analysis')
  @ApiOperation({
    description: 'Sentiment Analysis of a post',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  async sentimentAnalysis(
    @Param('owner') owner: string,
    @Body() body: SentimentsDto,
  ) {
    return await this.postsService.sentimentAnalysis(owner, body);
  }

}