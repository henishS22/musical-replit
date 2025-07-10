import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import {
  Notify,
  NotifyDocument,
  Room,
  RoomsDocument,
} from '@/src/schemas/schemas';
import { NotifyTypeEnum } from '../utils/enums';
import { PushNotificationsService } from '../services/pushNotifications.service';

@Injectable()
export default class SocketService {
  constructor(
    @InjectModel(Room.name) private roomsModel: Model<RoomsDocument>,
    @InjectModel(Notify.name) private notifyModel: Model<NotifyDocument>,
    private pushNotificationsService: PushNotificationsService,
  ) {}
  async getActiveRoom(user_id: string, room_url: string, room_name: string) {
    const room = await this.roomsModel.aggregate([
      {
        $match: {
          user_id: new ObjectId(user_id),
          room_name: room_name,
          room_url: room_url,
          exp: {
            $gte: Date.now() / 1000,
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user',
        },
      },
    ]);

    if (room[0] != null) {
      return { ...room[0], user: room[0].user[0] };
    }

    return null;
  }

  async sendPushNotification(from: string, to: string, room_id: string) {
    try {
      const entry = await this.notifyModel.findOne({
        type: NotifyTypeEnum.CALL,
        from: new ObjectId(from),
        to: new ObjectId(to),
        resource: new ObjectId(room_id),
      });

      if (entry != null) {
        return;
      }

      const newNotify = new this.notifyModel({
        type: NotifyTypeEnum.CALL,
        from: new ObjectId(from),
        to: new ObjectId(to),
        resource: new ObjectId(room_id),
        viewed: false,
      });

      await newNotify.save();
      this.pushNotificationsService.sendPushNotification(newNotify);
    } catch (e) {
      console.log('Error sending push notification', e);
    }
  }
}
