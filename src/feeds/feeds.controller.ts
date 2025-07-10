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
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Observable } from 'rxjs';
import {
  ApiBearerAuth,
  ApiTags,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiOperation,
} from '@nestjs/swagger';

// Services Imports
import { FeedsService } from './feeds.service';
import { CommentOnActivityDto } from './dto/commentOnActivity.dto';
import { ChangeReactionOnActivityDto } from './dto/changeReactionOnActivity.dto';
import { GetActivitiesDto } from './dto/getActivities.dto';
import { GetReactionsDto } from './dto/getReactions.dto';
import { ActivityInteractionGuard } from './helper/guards/activityInteraction.guard';

@Controller('feeds')
@ApiTags('Feeds')
@ApiBearerAuth()
export class FeedsController {
  constructor(private readonly feedsService: FeedsService) {}

  @UseGuards(JwtAuthGuard, ActivityInteractionGuard())
  @Get('/activities')
  @ApiOperation({ summary: 'Get activities' })
  @ApiOkResponse({ description: 'Return activities' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  getActivities(@Param('owner') owner: string, @Query() options: any) {
    return this.feedsService.getUserFeedActivities(owner, {
      afterId: options.afterId,
      limit: options.limit,
      types: options.types,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/activities/:activityId')
  @ApiOperation({ summary: 'Get activity' })
  @ApiOkResponse({ description: 'Return activity' })
  @ApiNotFoundResponse({ description: 'Activity not found' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getActivity(
    @Param('owner') owner: string,
    @Param('activityId') activityId: string,
  ) {
    return this.feedsService.getActivity(owner, activityId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/activities/:activityId/comments')
  @ApiOperation({ summary: 'Comment on activity' })
  @ApiOkResponse({ description: 'Comment on activity' })
  @ApiNotFoundResponse({ description: 'Activity not found' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  commentOnActivity(
    @Param('owner') owner: string,
    @Param('activityId') activityId: string,
    @Body() commentOnActivityDto: CommentOnActivityDto,
  ) {
    return this.feedsService.commentOnActivity(
      commentOnActivityDto.comment,
      activityId,
      owner,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('comments/:commentId')
  @ApiOperation({ summary: 'Delete comment' })
  @ApiOkResponse({ description: 'Delete comment' })
  @ApiNotFoundResponse({ description: 'Comment not found' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  deleteCommentFromActivity(
    @Param('owner') owner: string,
    @Param('commentId') commentId: string,
  ) {
    return this.feedsService.deleteComment(commentId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/activities/:activityId/react')
  @ApiOperation({ summary: 'React on activity' })
  @ApiOkResponse({ description: 'React on activity' })
  @ApiNotFoundResponse({ description: 'Activity not found' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  changeReactionOfActivity(
    @Param('owner') owner: string,
    @Param('activityId') activityId: string,
    @Body() changeReactionOnActivityDto: ChangeReactionOnActivityDto,
  ) {
    return this.feedsService.changeReactionOnActivity(
      activityId,
      owner,
      changeReactionOnActivityDto.type || null,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/activities/:activityId/reactions')
  @ApiOperation({ summary: 'Get reactions on activity' })
  @ApiOkResponse({ description: 'Return reactions on activity' })
  @ApiNotFoundResponse({ description: 'Activity not found' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  getReactionsOnActivity(
    @Param('owner') owner: string,
    @Param('activityId') activityId: string,
    @Query() options: GetReactionsDto,
  ) {
    return this.feedsService.getActivityReactions(activityId, { ...options });
  }
}
