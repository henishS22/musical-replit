import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { MessageService } from '../services/message.services';
import { JwtAuthGuard } from '@/src/guards/jwt-auth.guard';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { SendMessageDto } from '../dto/message.dto';
import { FeatureValidationGuard } from '@/src/guards/feature-validation.guard';
import { Features } from '@/src/decorators/features.decorator';

@Controller('messages')
export class MessageController {
  constructor(private readonly messagesService: MessageService) { }

  @UseGuards(JwtAuthGuard, FeatureValidationGuard)
  @Features([
    { featureKey: 'fan_messaging' },
  ])
  @Get('/:platform')
  @ApiOperation({
    description: 'Get messages for specific platform',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  @ApiOkResponse({
    description: 'Conversations',
  })
  @ApiBadRequestResponse({
    description: 'Messaging Not Enabled',
  })
  async getMessages(
    @Param('owner') owner: string,
    @Param('platform') platform: string,
    @Query('conversationsOnly') conversationsOnly: string,
    @Query('conversationId') conversationId: string,
  ) {
    return await this.messagesService.getMessages(owner, platform, conversationsOnly, conversationId);
  }

  @UseGuards(JwtAuthGuard, FeatureValidationGuard)
  @Features([
    { featureKey: 'fan_messaging' },
  ])
  @Post('/:platform')
  @ApiOperation({
    description: 'Send message to recipient',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  @ApiOkResponse({
    description: 'Media Urls',
  })
  @ApiBadRequestResponse({
    description: 'Error',
  })
  @ApiBadRequestResponse({
    description: 'Media Urls',
  })
  async sendMessage(
    @Param('owner') owner: string,
    @Param('platform') platform: string,
    @Body() body: SendMessageDto,
  ) {
    return await this.messagesService.sendMessage(owner, platform, body);
  }
}
