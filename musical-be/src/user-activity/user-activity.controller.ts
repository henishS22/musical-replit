import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserActivityService } from './user-activity.service';
import { UserActivityDto } from './dto/userActivity.dto';

@Controller('user-activity')
export class UserActivityController {
    constructor(private readonly userActivityService: UserActivityService) { }

    /**
     * Get user event activity which are part of the platform
     * @param owner user id
     * @returns activity
     */
    @UseGuards(JwtAuthGuard)
    @Get('getEvents')
    @ApiOperation({ summary: 'Get events' })
    @ApiOkResponse({
        description: 'Returns the project',
        type: UserActivityDto,
    })
    @ApiNotFoundResponse({ description: 'Events not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden' })
    getTracksByProjectId(
        @Param('owner') userId: string,
        @Query('limit') limit?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('search') search?: string,
        @Query('page') page?: string,
    ) {
        return this.userActivityService.getEventActivity({
            userId,
            filter: { startDate, endDate, limit, page },
            search,
        });
    }
}
