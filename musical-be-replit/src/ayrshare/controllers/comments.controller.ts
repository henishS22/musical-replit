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
import { CommentsService } from '../services/comments.services';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  DeleteCommentDto,
  PostCommentDto,
  ReplyToCommentDto,
} from '../dto/comments.dto';
import { JwtAuthGuard } from '@/src/guards/jwt-auth.guard';

@Controller('comment')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    description: 'Write comment',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  @ApiBadRequestResponse({
    description: 'Not Linked and success',
  })
  @ApiBadRequestResponse({
    description: 'Duplicate comment',
  })
  async postComment(
    @Param('owner') owner: string,
    @Body() body: PostCommentDto,
  ) {
    return await this.commentsService.postComment(owner, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    description: 'Get Comments',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  @ApiNotFoundResponse({
    description: 'Comments not found',
  })
  async getComments(@Param('owner') owner: string, @Query('id') id: string) {
    return await this.commentsService.getComments(owner, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  @ApiOperation({
    description: 'Delete comment',
  })
  @ApiOkResponse({
    description: 'Success Single Comment',
  })
  @ApiOkResponse({
    description: 'Success Multiple Comment',
  })
  @ApiBadRequestResponse({
    description: 'Comment id not found',
  })
  async deleteComment(
    @Param('owner') owner: string,
    @Param('id') id: string,
    @Body() body: DeleteCommentDto,
  ) {
    const { platforms } = body;
    return await this.commentsService.deleteComment(owner, id, platforms);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/reply')
  @ApiOperation({
    description: 'Reply to comment',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  @ApiBadRequestResponse({
    description: 'UnKnown CommentId',
  })
  async replyToComment(
    @Param('owner') owner: string,
    @Param('id') id: string,
    @Body() body: ReplyToCommentDto,
  ) {
    return await this.commentsService.replyToComment(owner, id, body);
  }
}
