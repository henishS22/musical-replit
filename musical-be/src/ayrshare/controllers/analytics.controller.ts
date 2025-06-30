import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.services';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  PostAnalyticsDto,
  SocialNetworkAnalyticsDto,
} from '../dto/analytics.dto';
import { JwtAuthGuard } from '@/src/guards/jwt-auth.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('post')
  @ApiOperation({
    description: 'Analytics for posts',
  })
  @ApiOkResponse({
    description: 'Success Response',
  })
  @ApiNotFoundResponse({
    description: 'Bad Request',
  })
  @ApiNotFoundResponse({
    description: 'Not Found',
  })
  async postAnalytics(
    @Param('owner') owner: string,
    @Body() body: PostAnalyticsDto,
  ) {
    return this.analyticsService.postAnalytics(owner, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('social')
  @ApiOperation({
    description: 'Analytics for social network',
  })
  @ApiOkResponse({
    description: 'Success Response',
  })
  @ApiOkResponse({
    description: 'Success Daily',
  })
  @ApiBadRequestResponse({
    description: 'Not Found',
  })
  async socialNetworkAnalytics(
    @Param('owner') owner: string,
    @Body() body: SocialNetworkAnalyticsDto,
  ) {
    return await this.analyticsService.socialNetworkAnalytics(owner, body);
  }
}
