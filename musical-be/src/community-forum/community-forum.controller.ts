import { Controller, Get, Post, Put, Delete, Query, Body, Param, UseGuards } from '@nestjs/common';
import { CommunityForumService } from './community-forum.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CreateForumDto } from './dto/forum.dto';

@Controller('community-forum')
export class CommunityForumController {
  constructor(private readonly communityForumService: CommunityForumService) { }

  @UseGuards(JwtAuthGuard)
  @Post('createTopic')
  create(@Param('owner') userId: string, @Body() createTopicDto: { title: string; forumId: string; description: string }) {
    return this.communityForumService.createTopic(userId, createTopicDto.title, createTopicDto.forumId, createTopicDto.description);
  }

  @UseGuards(JwtAuthGuard)
  @Get('getAllTopic')
  findAll() {
    return this.communityForumService.getAllTopics();
  }

  @UseGuards(JwtAuthGuard)
  @Get('getTopicById/:id')
  findOne(@Param('id') id: string) {
    return this.communityForumService.getTopicById(id);
  }

  @Get('search')
  async searchTopics(@Query('query') query: string) {
    return this.communityForumService.searchTopics(query);
  }


  //add Comment
  @UseGuards(JwtAuthGuard)
  @Post('addComment/:topicId')
  addComment(@Param('topicId') topicId: string, @Param('owner') userId: string, @Body() body: { content: string; parentCommentId?: string }) {
    return this.communityForumService.addComment(topicId, body.content, userId, body.parentCommentId);
  }

  @Put('updateComment/:id')
  async updateComment(@Param('id') id: string, @Body() body: { content: string }) {
    return this.communityForumService.updateComment(id, body.content);
  }

  @Delete('deleteComment/:id')
  async deleteComment(@Param('id') id: string) {
    return this.communityForumService.deleteComment(id);
  }

  //forum
  @Post('forum')
  @UseGuards(JwtAuthGuard)
  createForum(@Body() createForumDto: CreateForumDto) {
    return this.communityForumService.createForum(createForumDto);
  }

  @Get('forum')
  @UseGuards(JwtAuthGuard)
  findAllForum() {
    return this.communityForumService.findAllForum();
  }

  //update topic
  @UseGuards(JwtAuthGuard)
  @Put('updateTopic/:id')
  update(
    @Param('owner') userId: string,
    @Param('id') topicId: string,
    @Body() updateTopicDto: { title: string; forumId: string; description: string }
  ) {
    return this.communityForumService.updateTopic(userId, updateTopicDto.title, updateTopicDto.forumId, updateTopicDto.description, topicId);
  }


  //delete topic
  @UseGuards(JwtAuthGuard)
  @Get('deleteTopic/:id')
  delete(
    @Param('owner') userId: string,
    @Param('id') topicId: string,
  ) {
    return this.communityForumService.deleteTopic(userId, topicId);
  }
}
