import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { LoggingInterceptor } from '../interceptors/loggin.interceptor';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SongContestService } from './song-contest.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { SongContestResponseDto } from './dto/response.songContest.dto';
import {
  RequestApplicationDto,
  SongContestDto,
  UpdateSongContestDto,
  applicationFilters,
  updateApplication,
} from './dto';
import {
  ResourceAuthGuard,
  ResourceType,
} from '../users/guards/resource-auth.guard';
import { addFilters } from '../users/dto/addFilters.dto';
import { SavedSongContestDto } from './dto/saved.songContest.dto';

@Controller('song-contest')
@UseInterceptors(LoggingInterceptor)
@ApiTags('song-contest')
export class SongContestController {
  private readonly logger = new Logger('Song Contest Controller');
  constructor(private readonly songContestService: SongContestService) { }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Creates a user Song Contest ' })
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'The Song Contest has been successfully created',
    type: SongContestResponseDto,
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadGatewayResponse({ description: 'Invalid data type' })
  async createSongContest(
    @Param('owner') owner: string,
    @Body() data: SongContestDto,
  ) {
    return this.songContestService.createSongContest({ id: owner, data });
  }

  @Get('get-all-song-contest')
  @ApiOkResponse({
    description: 'Returns all song contest opportunities',
  })
  async getAllSongContest(
    @Query(new ValidationPipe({ transform: true })) filters: addFilters,
  ) {
    return this.songContestService.getAllSongContest({
      offSet: filters.offSet,
      filters: filters && {
        styles: filters.styles,
        seeking: filters.seeking,
        languages: filters.languages,
      },
      sortBy: filters.sortBy,
      projectId: filters.projectId,
      txtFilter: filters.txtFilter,
      selectedTabFilter: filters.selectedTabFilter,
      collaborateWith: filters.collaborateWith,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id/get-all-song-contest')
  @ApiOkResponse({
    description: 'Returns all song contest opportunities',
  })
  async getAllSongContestAuth(
    @Param('id') userId: string,
    @Query(new ValidationPipe({ transform: true })) filters: addFilters,
  ) {
    return this.songContestService.getAllSongContest({
      offSet: filters.offSet,
      filters: filters && {
        styles: filters.styles,
        seeking: filters.seeking,
        languages: filters.languages,
      },
      sortBy: filters.sortBy,
      projectId: filters.projectId,
      txtFilter: filters.txtFilter,
      selectedTabFilter: filters.selectedTabFilter,
      userId,
      collaborateWith: filters.collaborateWith,
    });
  }

  @Get('get-song-contest/:id')
  @ApiOperation({ summary: 'Gets Song Contest opportunities' })
  @ApiOkResponse({
    description: 'Returns Song Contest opportunities',
    type: [SongContestResponseDto],
  })
  async getSongContestDetails(@Param('id') id: string) {
    return this.songContestService.getSongContestDetails(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update-song-contest/:id')
  @ApiOperation({ summary: 'Updates a user Song Contest ' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns Song Contest opportunities',
    type: [SongContestResponseDto],
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Invalid data type' })
  async updateSongContest(
    @Param('id') id: string,
    @Body() updateSongContestDto: UpdateSongContestDto,
  ) {
    return this.songContestService.updateSongContest({
      id,
      updateSongContestDto,
    });
  }

  @UseGuards(JwtAuthGuard, ResourceAuthGuard(ResourceType.Collaborations))
  @Delete('delete-song-contest/:id')
  @ApiOperation({ summary: 'Deletes a user Song Contest ' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Ok' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async deleteSongContest(@Param('id') id: string) {
    return this.songContestService.deleteSongContest(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('save-song-contest')
  @ApiOperation({ summary: 'Saves a user Song Contest ' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Song Contest Saved Successfully',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async saveSongContest(
    @Param('owner') owner: string,
    @Body() data: SavedSongContestDto,
  ) {
    return this.songContestService.savedSongContest(owner, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete-saved-song-contest/:id')
  @ApiOperation({ summary: 'Deletes a user Saved Song Contest ' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Song Contest deleted successfully' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async deleteSavedSongContest(
    @Param('id') id: string,
    @Param('owner') owner: string,
  ) {
    return this.songContestService.removeSavedSongContest(id, owner);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-saved-song-contest-ids')
  @ApiOperation({ summary: 'Gets all saved Song Contest ids ' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns all saved Song Contest ids',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async getSavedSongContestIds(@Param('owner') owner: string) {
    return this.songContestService.getIdOfSavedSongContest(owner);
  }

  @UseGuards(JwtAuthGuard)
  @Post('apply-song-contest')
  @ApiOperation({ summary: 'Apply for a Song Contest ' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Application submitted successfully',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async applySongContest(
    @Param('owner') userId: string,
    @Body() data: RequestApplicationDto,
  ) {
    return this.songContestService.applyForSongContest(data, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-applications/:id')
  @ApiOperation({ summary: 'ok' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'fetched applications successfully',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async getApplications(
    @Param('owner') userId: string,
    @Param('id') songContestId: string,
  ) {
    return this.songContestService.getApplications(userId, songContestId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('used-projects')
  @ApiOperation({ summary: 'ok' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'fetched used projects successfully',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async getUsedProjects(@Param('owner') userId: string) {
    return this.songContestService.getProjectsFromSongContests(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-applications-by-project-id/:id')
  @ApiOperation({ summary: 'ok' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'fetched applications successfully',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async getApplicationsByProjectId(
    @Param('owner') userId: string,
    @Param('id') projectId: string,
    @Query(new ValidationPipe({ transform: true }))
    tabFilter: applicationFilters,
  ) {
    return this.songContestService.getApplicationsByProjectId(
      userId,
      projectId,
      tabFilter.tabFilter,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('update-application-status/:id')
  @ApiOperation({ summary: 'ok' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'applications updated successfully',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async updateApplicationStatus(
    @Param('owner') userId: string,
    @Param('id') applicationId: string,
    @Body() data: updateApplication,
  ) {
    return this.songContestService.updateApplication(data, applicationId);
  }

  // @UseGuards(JwtAuthGuard)
  @Get('create-collaborations-list/:id')
  @ApiOperation({ summary: 'ok' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'fetched song contests successfully',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async collaborationsList(
    @Param('id') userId: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string | null,
    @Query('endDate') endDate?: string | null,
    @Query('page') page?: string,
  ) {
    return this.songContestService.collaborationsList({
      userId,
      filter: { startDate, endDate, limit, page },
    });
  }


  @UseGuards(JwtAuthGuard)
  @Get('applied-collaborations-list')
  @ApiOperation({ summary: 'ok' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'fetched applied opportunity successfully',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async appliedList(
    @Param('owner') userId: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string | null,
    @Query('endDate') endDate?: string | null,
    @Query('page') page?: string,
  ) {
    return this.songContestService.appliedList({
      userId,
      filter: { startDate, endDate, limit, page },
    });
  }

  //check if user has applied to a project
  @UseGuards(JwtAuthGuard)
  @Get('check-application')
  @ApiOperation({ summary: 'ok' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'check application successfully',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async checkApplication(
    @Param('owner') userId: string,
    @Query('id') id: string,
  ) {
    return this.songContestService.checkApplication(userId, id,);
  }
}
