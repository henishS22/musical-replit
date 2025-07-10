import { Socket } from 'socket.io';
import { CancelCall } from '../dto/cancelCall.dto';
import { CreateCallDto } from '../dto/createCall.dto';
import { Context } from '../utils/types';
import { Param, ValidateAll } from './decorators/validator';
import SocketService from './socket.service';

export default class SocketController {
  constructor(socketService: SocketService) {
    this.socketService = socketService;
  }

  @ValidateAll
  async call(
    @Param(CreateCallDto) body: CreateCallDto,
    { sub, sendMessageUser, addOffSubscription }: Context,
  ) {
    const room = await this.socketService.getActiveRoom(
      sub,
      body.room_url,
      body.room_name,
    );

    if (room == null) {
      return;
    }

    await this.socketService.sendPushNotification(
      sub,
      body.user_target,
      room._id,
    );

    sendMessageUser(
      body.user_target,
      async (client: Socket) => {
        client.emit('call', room);
        addOffSubscription('call', () => {
          client.emit('call', {
            cancel: true,
            user_id: sub,
          });
        });
        return;
      },
      {
        survive: true,
      },
    );
  }

  @ValidateAll
  async cancelCall(
    @Param(CancelCall) body: CancelCall,
    {
      sendMessageUser,
      cleanOffSubscription,
      sub,
      cleanOffSurvivalEvents,
    }: Context,
  ) {
    sendMessageUser(body.user_target, (client: Socket) => {
      client.emit('call', { user_id: sub, cancel: true });
      cleanOffSurvivalEvents('call', body.user_target);
      cleanOffSubscription('call', sub);
      return;
    });
  }

  @ValidateAll
  async answerCall(
    @Param(CancelCall) body: CancelCall,
    {
      sendMessageUser,
      cleanOffSurvivalEvents,
      cleanOffSubscription,
      sub,
    }: Context,
  ) {
    sendMessageUser(sub, (client: Socket) => {
      cleanOffSurvivalEvents('call', sub);
      client.emit('call', { user_id: body.user_target, cancel: true });
      return;
    });
    sendMessageUser(body.user_target, (client: Socket) => {
      cleanOffSubscription('call', body.user_target);
      client.emit('answerCall', {
        user_id: sub,
      });
      return;
    });
  }

  private readonly socketService: SocketService;
}
