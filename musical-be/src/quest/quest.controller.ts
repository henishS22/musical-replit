import { Body, Controller, Get, Param, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { QuestService } from './quest.service';
import { CreatorQuestDto, PublishedQuestDto, UpdateCreatorQuestDto } from './dto/quest.dto';
import { LoggingInterceptor } from '../interceptors/loggin.interceptor';

@Controller('creator-quest')
@UseInterceptors(LoggingInterceptor)
export class QuestController {
  constructor(private readonly questService: QuestService) { }

  @UseGuards(JwtAuthGuard)
  @Post('/create')
  @ApiOperation({ description: 'Create mission for user', })
  @ApiOkResponse({ description: 'Success', })
  @ApiBadRequestResponse({ description: 'Bad request', })
  async create(
    @Param('owner') owner: string,
    @Body() body: CreatorQuestDto
  ) {
    return await this.questService.create(owner, body);
  }

  //Update mission
  @UseGuards(JwtAuthGuard)
  @Post('/update')
  @ApiOperation({ description: 'Update mission for user', })
  @ApiOkResponse({ description: 'Success', })
  @ApiBadRequestResponse({ description: 'Bad request', })
  async update(
    @Param('owner') owner: string,
    @Body() body: UpdateCreatorQuestDto
  ) {
    return await this.questService.update(owner, body);
  }

  //Published mission for platform user
  @UseGuards(JwtAuthGuard)
  @Post('/published')
  @ApiOperation({ description: 'Published mission for user', })
  @ApiOkResponse({ description: 'Success', })
  @ApiBadRequestResponse({ description: 'Bad request', })
  async publish(
    @Param('owner') owner: string,
    @Body() body: PublishedQuestDto
  ) {
    return await this.questService.publish(owner, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/admin-quest')
  @ApiOperation({ description: 'List of mission created by admin that performed by user.', })
  @ApiOkResponse({ description: 'Success', })
  @ApiBadRequestResponse({ description: 'Bad request', })
  async adminQuest(
    @Param('owner') owner: string,
  ) {
    return await this.questService.questList(owner);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/admin-quest-by-user')
  @ApiOperation({ description: 'List of mission created by admin those publishable by user.', })
  @ApiOkResponse({ description: 'Success', })
  @ApiBadRequestResponse({ description: 'Bad request', })
  async questPublishableByUser(
    @Param('owner') owner: string,
  ) {
    return await this.questService.questPublishableByUser(owner);
  }

  //List of creator published mission.(published/not-published)
  @UseGuards(JwtAuthGuard)
  @Get('/creator-quest')
  @ApiOperation({ description: 'List of creator published mission.(published/not-published)', })
  @ApiOkResponse({ description: 'Success', })
  @ApiBadRequestResponse({ description: 'Bad request', })
  async creatorQuest(
    @Param('owner') owner: string,
  ) {
    return await this.questService.questListByUser(owner);
  }

  //List of mission that created by user and ready for join for all users
  @UseGuards(JwtAuthGuard)
  @Get('/platform-quest')
  @ApiOperation({ description: 'List of creator published quest.', })
  @ApiOkResponse({ description: 'Success', })
  @ApiBadRequestResponse({ description: 'Bad request', })
  async questListForPlatform(
    @Param('owner') owner: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.questService.questListForPlatform({ owner, query: { startDate, endDate, search, limit, page } });
  }

  //Quest History for user 
  @UseGuards(JwtAuthGuard)
  @Get('/history')
  @ApiOperation({ summary: 'Get mission history for user' })
  @ApiOkResponse({ description: 'Returns the project' })
  @ApiNotFoundResponse({ description: 'History not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  history(
    @Param('owner') owner: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    return this.questService.history({ owner, query: { startDate, endDate, limit, page, search } });
  }

  //Quest History for quest that access by that quest owner 
  @UseGuards(JwtAuthGuard)
  @Get('/quest-history')
  @ApiOperation({ summary: 'Get mission history' })
  @ApiOkResponse({ description: 'Returns the project' })
  @ApiNotFoundResponse({ description: 'History not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  questHistory(
    @Param('owner') owner: string,
    @Query('creatorQuestId') creatorQuestId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.questService.questHistory({ owner, query: { startDate, endDate, limit, page, creatorQuestId } });
  }

  //Mission Details with isAvailable flag
  @UseGuards(JwtAuthGuard)
  @Get('/details')
  @ApiOperation({ description: 'Mission Details', })
  @ApiOkResponse({ description: 'Success', })
  @ApiBadRequestResponse({ description: 'Bad request', })
  async questDetails(
    @Param('owner') owner: string,
    @Query('creatorQuestId') creatorQuestId: string,
  ) {
    return await this.questService.questDetails(owner, creatorQuestId);
  }


  //Leaderboard for mission
  @UseGuards(JwtAuthGuard)
  @Get('/leaderboard')
  @ApiOperation({ summary: 'Get mission history' })
  @ApiOkResponse({ description: 'Returns the project' })
  @ApiNotFoundResponse({ description: 'History not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  leaderboard(
    @Param('owner') owner: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.questService.leaderboard({ owner, query: { limit, page } });
  }

  //List of creator published mission.(published)
  @UseGuards(JwtAuthGuard)
  @Get('/creator-quest-list')
  @ApiOperation({ description: 'List of creator published mission.(published)', })
  @ApiOkResponse({ description: 'Success', })
  @ApiBadRequestResponse({ description: 'Bad request', })
  async creatorQuestList(
    @Query('userId') userId: string,
  ) {
    return await this.questService.questListByCreator(userId);
  }



  //Leaderboard for creator quest history
  @UseGuards(JwtAuthGuard)
  @Get('/quest-leaderboard')
  @ApiOperation({ summary: 'Get mission history' })
  @ApiOkResponse({ description: 'Returns the project' })
  @ApiNotFoundResponse({ description: 'History not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  questLeaderboard(
    @Param('owner') owner: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.questService.questLeaderboard({ owner, query: { limit, page } });
  }
}