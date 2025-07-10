import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

// Services Imports
import { ChatService } from './chat.service';

import { createChannelDto } from './dto/createChannel.dto';
import { CreateCallingDto } from './dto/createCalling';
import { UpdateCallingAnswer } from './dto/callingAnswer';
import { CreateAccessAnswer } from './dto/accessAnswer';
import {
  ApiBearerAuth,
  ApiTags,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { RoomResponseDto } from './dto/definitions/roomResponse.dto';
import { ChannelResponse } from './dto/definitions/channelResponse.dto';
import { CallingResponseDto } from './dto/definitions/callingResponse.dto';
import { AccessRequestResponseDto } from './dto/definitions/accessRequestResponse.dto';

@Controller('chat')
@ApiTags('Chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('/createCommunityChannel')
  async createCommunityChannel(@Body('createdById') createdById: string) {
    return this.chatService.createCommunityChannel({ createdById });
  }

  @UseGuards(JwtAuthGuard)
  @Post('/room')
  @ApiOperation({
    summary: 'Creates a new room',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Return room status if the operation is performed',
    type: RoomResponseDto,
  })
  @ApiOperation({
    summary: 'Creates a new room',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  createRoom(
    @Param('owner') owner: string,
    @Body('max_participants') max_participants: number,
  ) {
    return this.chatService.createRoom({
      user_id: owner,
      max_participants,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/room/:user_target')
  @ApiOperation({
    summary: 'Get a room of the user',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Return a room of the user_target, iff exists the room',
    type: RoomResponseDto,
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  getRoom(
    @Param('owner') owner: string,
    @Param('user_target') user_target: string,
  ) {
    return this.chatService.getActiveRoom({
      user_id: owner,
      user_target: user_target,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put('/room/')
  @ApiOperation({
    summary: 'Request access to a room',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description:
      'Return the token in order to have permission to enter the room',
    type: String,
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  requestRoom(
    @Param('owner') owner: string,
    @Body('room_name') room_name: string,
  ) {
    return this.chatService.requestAccessToRoom({
      user_id: owner,
      room_name,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/room/')
  @ApiOperation({
    summary: 'Leave a room',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Return success',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  exitRoom(@Param('owner') owner: string) {
    return this.chatService.exitRoom(owner);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/token/')
  @ApiOperation({
    summary: 'Return a token to access the chat services',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Return the token',
    type: String,
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  createChatToken(@Param('owner') owner: string) {
    return this.chatService.createOrRefreshToken(owner);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/channel')
  @ApiOperation({
    summary: 'Creates a new channel',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Return the channel created',
    type: ChannelResponse,
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  createChannelChat(
    @Param('owner') owner: string,
    @Body() channel: createChannelDto,
  ) {
    return this.chatService.createChannel({
      ...channel,
      id: owner,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('/checkChatAccount')
  @ApiOperation({
    summary:
      'Check if the user have a account in the chat services, if not creates one',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Return the channel created',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  checkChatAccount(@Param('owner') owner: string) {
    return this.chatService.checkAccountChat({
      id: owner,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('/call')
  @ApiOperation({
    summary: 'Creates a call request to a user that last 5 seconds',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Return success if the call was created',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  createCall(@Param('owner') owner: string, @Body() call: CreateCallingDto) {
    return this.chatService.createRoomCalling({
      ...call,
      user_id: owner,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/call')
  @ApiOperation({
    summary: 'Get alls calls that the user is receiving',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Return the calls',
    type: CallingResponseDto,
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  getCalls(@Param('owner') owner: string) {
    return this.chatService.getCalls(owner);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/answer')
  @ApiOperation({
    summary: 'Answer an active call',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Return success if the call was created',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  giveAnswerToCall(
    @Param('owner') owner: string,
    @Body() answer: UpdateCallingAnswer,
  ): Promise<any> {
    return this.chatService.giveAnswerToCall({
      ...answer,
      user_id: owner,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('/access')
  @ApiOperation({
    summary: 'Answer to a user that required acess to a room',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Return success if the call was created',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  giveAnswerToRoomAccess(
    @Param('owner') owner: string,
    @Body() answer: CreateAccessAnswer,
  ) {
    return this.chatService.getAnswerForRoomAccess({
      ...answer,
      user_id: owner,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/requests')
  @ApiOperation({
    summary: 'Return all users that are requiring the user room',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Return the token',
    type: AccessRequestResponseDto,
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  getAllUnAnsweredAccesses(@Param('owner') owner: string) {
    return this.chatService.getAllUnAnsweredAccesses(owner);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/updateUser')
  @ApiOperation({
    summary: 'Update the user information in the chat services',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Return success if the user was updated',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  updateUser(
    @Param('owner') owner: string,
    @Body()
    user: { id: string; name: string; profile_image: string; role: string },
  ) {
    return this.chatService.updateUser(user);
  }
}
