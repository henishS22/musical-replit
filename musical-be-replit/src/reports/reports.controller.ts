import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/src/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UsersPerDeviceAcrossTimeResponseDto } from './dto/definitions/usersPerDeviceAcrossTimeResponse.dto';
import { InvitesSentResponseDto } from './dto/definitions/invitesSentResponse.dto';
import { CreatedProjectsResponseDto } from './dto/definitions/createdProjectsResponse.dto';
import { PostedCollaborationsResponseDto } from './dto/definitions/postedCollaborationsResponse.dto';
import { AverageUploadedFilesResponseDto } from './dto/definitions/averageUploadedFilesResponse.dto';
import { CreatedProjectsPerUserAcrossTimeResponseDto } from './dto/definitions/createdProjectsPerUserAcrossTimeResponse.dto';
import { PostedCollaborationsPerUserAcrossTimeResponseDto } from './dto/definitions/postedCollaborationsPerUserAcrossTimeResponse.dto';
import { UploadedFilesPerUserAcrossTimeResponseDto } from './dto/definitions/uploadedFilesPerUserAcrossTimeResponse.dto';
import { UploadedFilesPerUserAcrossTimeDto } from './dto/uploadedFilesPerUserAcrossTime.dto';
import { RoleAuthGuard } from './helper/guards/roles-auth.guard';
import { RolesEnum } from '../users/utils/enums';

@Controller('reports')
@ApiTags('Reports')
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('users/per-device-across-time')
  @UseGuards(RoleAuthGuard([RolesEnum.ADMIN]))
  @ApiOperation({
    summary: 'Get the number of users registered by devices across time',
  })
  @ApiOkResponse({
    description: 'Array of total registers grouped by date',
    type: UsersPerDeviceAcrossTimeResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden. Only admins can access this route',
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async getUsersRegisteredAcrossTimeByDevice(
    @Param('owner') owner: string,
    @Query() query: any,
  ) {
    const { startAt, endAt, groupBy } = query;
    return this.reportsService.generateUsersPerDeviceAcrossTimeReport(
      new Date(startAt),
      new Date(endAt),
      groupBy,
    );
  }

  @Get('users/invites-sent')
  @UseGuards(RoleAuthGuard([RolesEnum.ADMIN]))
  @ApiOperation({
    summary: 'Get the number of invites sent by users',
  })
  @ApiOkResponse({
    description: 'Array of users that sent invites',
    type: InvitesSentResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden. Only admins can access this route',
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async getInvitesSent(@Param('owner') owner: string, @Query() query: any) {
    const { startAt, endAt } = query;

    return this.reportsService.generateInvitesSentReport(
      new Date(startAt),
      new Date(endAt),
    );
  }

  @Get('projects/created')
  @UseGuards(RoleAuthGuard([RolesEnum.ADMIN]))
  @ApiOperation({
    summary: 'Get the number of projects created by users',
  })
  @ApiOkResponse({
    description: 'Array of users that created projects',
    type: CreatedProjectsResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden. Only admins can access this route',
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async getCreatedProjects(@Param('owner') owner: string, @Query() query: any) {
    const { startAt, endAt } = query;

    return this.reportsService.generateCreatedProjectsReport(
      new Date(startAt),
      new Date(endAt),
    );
  }

  @Get('projects/created-per-user-across-time')
  @UseGuards(RoleAuthGuard([RolesEnum.ADMIN]))
  @ApiOperation({
    summary: 'Get the number of projects created per user across time',
  })
  @ApiOkResponse({
    description: 'Array of total projects created grouped by date',
    type: CreatedProjectsPerUserAcrossTimeResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden. Only admins can access this route',
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async getCreatedProjectsPerUserAcrossTime(
    @Param('owner') owner: string,
    @Query() query: any,
  ) {
    const { startAt, endAt, groupBy } = query;
    return this.reportsService.generateCreatedProjectsPerUserAcrossTimeReport(
      new Date(startAt),
      new Date(endAt),
      groupBy,
    );
  }

  @Get('collaborations/posted')
  @UseGuards(RoleAuthGuard([RolesEnum.ADMIN]))
  @ApiOperation({
    summary: 'Get the number of collaborations posted by users',
  })
  @ApiOkResponse({
    description: 'Total of collaborations posted by users',
    type: PostedCollaborationsResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden. Only admins can access this route',
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async getPostedCollaborations(
    @Param('owner') owner: string,
    @Query() query: any,
  ) {
    const { startAt, endAt } = query;
    return this.reportsService.generatePostedCollaborationsReport(
      new Date(startAt),
      new Date(endAt),
    );
  }

  @Get('collaborations/per-user-across-time')
  @UseGuards(RoleAuthGuard([RolesEnum.ADMIN]))
  @ApiOperation({
    summary: 'Get the number of collaborations posted per user across time',
  })
  @ApiOkResponse({
    description: 'Array of total collaborations posted grouped by date',
    type: PostedCollaborationsPerUserAcrossTimeResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden. Only admins can access this route',
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async getPostedCollaborationsPerUserAcrossTime(
    @Param('owner') owner: string,
    @Query() query: any,
  ) {
    const { startAt, endAt, groupBy } = query;
    return this.reportsService.getPostedCollaborationsPerUserAcrossTimeReport(
      new Date(startAt),
      new Date(endAt),
      groupBy,
    );
  }

  @Get('tracks/average-uploaded-files')
  @UseGuards(RoleAuthGuard([RolesEnum.ADMIN]))
  @ApiOperation({
    summary: 'Get the average of tracks uploaded by on a interval of time',
  })
  @ApiOkResponse({
    description: 'Average of tracks uploaded by users',
    type: AverageUploadedFilesResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden. Only admins can access this route',
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async getAverageUploadedFiles(
    @Param('owner') owner: string,
    @Query() query: any,
  ) {
    const { startAt, endAt, groupBy } = query;
    return this.reportsService.generateAverageUploadedFilesReport(
      new Date(startAt),
      new Date(endAt),
      groupBy,
    );
  }

  @Get('tracks/per-user-across-time')
  @UseGuards(RoleAuthGuard([RolesEnum.ADMIN]))
  @ApiOperation({
    summary: 'Get the number of uploaded files per user across time',
  })
  @ApiOkResponse({
    description: 'Array of total uploaded files grouped by date',
    type: UploadedFilesPerUserAcrossTimeResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden. Only admins can access this route',
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async getUploadedFilesPerUserAcrossTime(
    @Param('owner') owner: string,
    @Query() query: UploadedFilesPerUserAcrossTimeDto,
  ) {
    const { startAt, endAt, groupBy, mediaType } = query;
    return this.reportsService.getUploadedFilesPerUserAcrossTimeReport(
      new Date(startAt),
      new Date(endAt),
      groupBy,
      mediaType,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  @ApiOperation({
    description: 'Search Artists, Tracks and Projects by name',
  })
  @ApiOkResponse({
    description: 'Search response',
  })
  @ApiQuery({
    name: 'search',
    required: true,
  })
  async searchByName(
    @Param('owner') owner: string,
    @Query('search') searchText: string,
  ) {
    return await this.reportsService.searchByName(searchText, owner);
  }
}
