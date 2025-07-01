/**
 *  @file App main service file. Defines the services to be used in the microservice.
 *  @author Rafael Marques Siqueira
 *  @exports AppService
 */

import { Model } from 'mongoose';
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { User } from '@/src/schemas/schemas';
import {
  Room,
  RoomsDocument,
  RommsCallsDocument,
  RoomsCalls,
  RoomsAccess,
  RoomsAccessDocument,
} from '@/src/schemas/schemas';
import { CreateRoomDto } from './dto/createRoom';
import fetch from 'node-fetch';
import { RequestAccessRoom } from './dto/requestAccess';
import { StreamChat } from 'stream-chat';
import { CreateCallingDto } from './dto/createCalling';
import { ObjectId } from 'mongodb';
import { getAccessPermission } from './dto/accessPermission';
import { CreateAccessAnswer } from './dto/accessAnswer';
import { UpdateCallingAnswer } from './dto/callingAnswer';
import compareState from './utils/compareState';
import { UsersService } from '../users/users.service';
import { UserActivityService } from '../user-activity/user-activity.service';
import { EventTypeEnum } from '../gamificationEvent/utils/enum';

@Injectable()
export class ChatService {
  private configService: ConfigService<Record<string, unknown>, false>;
  constructor(
    private readonly userActivityService: UserActivityService,
    @InjectModel(Room.name) private roomsModel: Model<RoomsDocument>,
    @InjectModel(RoomsAccess.name)
    private roomAccessModel: Model<RoomsAccessDocument>,
    @InjectModel(RoomsCalls.name)
    private roomsCallsModel: Model<RommsCallsDocument>,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {
    this.configService = new ConfigService();
  }

  async createRoom(createUserDto: CreateRoomDto) {
    let room: any = await fetch(`https://api.daily.co/v1/rooms`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.configService.get<string>(
          'DAYLYCO_KEY',
        )}`,
      },
      body: JSON.stringify({
        properties: {
          enable_prejoin_ui: true,
          enable_network_ui: true,
          enable_screenshare: true,
          enable_chat: true,
          eject_at_room_exp: true,
          exp: Date.now() / 1000 + 432000, // 12 Hours of room limit
        },
      }),
    });

    const user = await this.usersService.findOne(
      createUserDto?.user_id?.toString(),
    );

    let permission: any = await fetch(
      `https://api.daily.co/v1/meeting-tokens`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.configService.get<string>(
            'DAYLYCO_KEY',
          )}`,
        },
        body: JSON.stringify({
          properties: {
            room_name: room.name,
            is_owner: true,
            user_name: user.name,
            user_id: createUserDto.user_id,
          },
        }),
      },
    );

    permission = await permission.json();
    room = await room.json();

    const createRoom = new this.roomsModel({
      ...createUserDto,
      room_id: room.id,
      room_name: room.name,
      room_url: room.url,
      privacy: room.privacy,
      exp: room.config.exp,
      user_id: createUserDto.user_id,
      token: permission.token,
      users_request_acess: [],
    });

    await createRoom.save();
    const key = this.configService.get<string>('DAYLYCO_KEY');
    const MAX_RECONNECTION = 6;

    const deleteEntry = () =>
      this.roomsModel.deleteOne({
        room_id: room.id,
      });

    function createListener(tries: number) {
      setTimeout(async (): Promise<void> => {
        let state = await fetch(
          `     https://api.daily.co/v1/presence
        `,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${key}`,
            },
          },
        );

        state = await state.json();
        const room_state = state[room.name] || [];
        const userAdmin = room_state.some(
          ({ userId }) => userId == createUserDto.user_id,
        );

        if (userAdmin) {
          createListener(MAX_RECONNECTION);
          return;
        }

        if (tries == 0) {
          await fetch(`https://api.daily.co/v1/rooms/${room.name}`, {
            method: 'DELETE',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${key}`,
            },
          });
          await deleteEntry();
          return;
        }

        createListener(tries - 1);
      }, 5 * 1000);
    }

    await this.roomsCallsModel.deleteMany({
      user_id: createUserDto.user_id,
    });

    await this.roomAccessModel.deleteMany({
      user_id: createUserDto.user_id,
    });

    createListener(MAX_RECONNECTION + 10);
    return { ...createRoom.toObject(), ...permission };
  }

  async getActiveRoom({ user_id, user_target }): Promise<RoomsDocument[]> {
    return this.roomsModel
      .find({
        user_id: user_target,
        exp: {
          $gte: Date.now() / 1000,
        },
      })
      .select(user_id == user_target ? '+token' : '');
  }

  async requestAccessToRoom(requestAccessDto: RequestAccessRoom) {
    const room = await this.roomsModel.findOne({
      room_name: requestAccessDto.room_name,
    });

    if (room == null) {
      return { waiting: false, authorized: false };
    }

    const query = {
      room_name: room.room_name,
      user_target: new ObjectId(requestAccessDto.user_id),
      user_id: new ObjectId(room.user_id),
    };
    const access = await this.roomAccessModel.findOne(query);

    if (access == null || access.answer == null) {
      if (access == null) {
        await this.roomAccessModel.create(query);
      }

      return { authorized: false, waiting: true };
    }

    if (access.answer == 'recused') {
      return { authorized: false, waiting: false };
    }

    const user = await this.usersService.findOne(
      requestAccessDto.user_id?.toString(),
    );

    let permission = await fetch(`https://api.daily.co/v1/meeting-tokens`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.configService.get<string>(
          'DAYLYCO_KEY',
        )}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: requestAccessDto.room_name,
          is_owner: false,
          user_name: user.name,
          user_id: requestAccessDto.user_id,
        },
      }),
    });
    permission = await permission.json();

    await this.roomsCallsModel.updateOne(
      {
        user_id: new ObjectId(room.user_id),
        user_target: new ObjectId(requestAccessDto.user_id),
      },
      { answer: 'accepted' },
      { upsert: false },
    );

    return { authorized: true, waiting: false, ...permission };
  }

  async exitRoom(user_id: string) {
    const active_rooms: any = await this.roomsModel.find({
      user_id: user_id,
    });

    const key = this.configService.get<string>('DAYLYCO_KEY');
    for (const entry of active_rooms) {
      try {
        await fetch(`https://api.daily.co/v1/rooms/${entry.room_name}`, {
          method: 'DELETE',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
          },
        });
      } catch (e) {
        //console.log('The room ' + entry.room_name + ' can not be freed');
        //In the worst case if the room exist and still active, the room will be freed in max 12 hours since you creation
      }
      await entry.delete();
    }
  }

  async createOrRefreshToken(user_id) {
    const client = StreamChat.getInstance(
      this.configService.get<string>('PUBLIC_KEY_GETSTREAM'),
      this.configService.get<string>('PRIVATE_KEY_GETSTREAM'),
    );

    return client.createToken(user_id);
  }

  async createUser({
    id,
    name,
    profile_img,
  }: {
    id: string;
    name: string;
    profile_img?: string;
  }) {
    const client = StreamChat.getInstance(
      this.configService.get<string>('PUBLIC_KEY_GETSTREAM'),
      this.configService.get<string>('PRIVATE_KEY_GETSTREAM'),
    );

    await client.upsertUser({
      id: id,
      role: 'user',
    });

    return await this.updateUser({
      id,
      name,
      profile_img,
    });
  }

  async updateUser({
    id,
    name,
    profile_img,
    role,
  }: {
    id: string;
    name?: string;
    profile_img?: string;
    role?: string;
  }) {
    const client = StreamChat.getInstance(
      this.configService.get<string>('PUBLIC_KEY_GETSTREAM'),
      this.configService.get<string>('PRIVATE_KEY_GETSTREAM'),
    );

    const update = {
      id: id,
      set: {
        role: role ?? 'user',
        ...(profile_img ? { image: profile_img } : {}),
        ...(name ? { name: name } : {}),
      },
    };

    return client.partialUpdateUser(update);
  }

  async checkAccountChat({ id }: { id: string }) {
    const client = StreamChat.getInstance(
      this.configService.get<string>('PUBLIC_KEY_GETSTREAM'),
      this.configService.get<string>('PRIVATE_KEY_GETSTREAM'),
    );
    const user = await client.queryUsers({ id });

    if (user.users.length > 0) {
      return user;
    }

    const lastUser = await this.usersService.findOne(id);

    if (lastUser == null) {
      return;
    }

    return this.createUser({
      id,
      ...lastUser,
    });
  }

  async createCommunityChannel({ createdById }: { createdById: string }) {
    const client = StreamChat.getInstance(
      this.configService.get<string>('PUBLIC_KEY_GETSTREAM'),
      this.configService.get<string>('PRIVATE_KEY_GETSTREAM'),
    );

    const channelsAlive = await client.queryChannels({
      id: 'community-channel',
    });

    if (channelsAlive.length) {
      return null;
    }

    const channel = client.channel(
      'community',
      this.configService.get<string>('COMMUNITY_CHANNEL_ID'),
      {
        name: 'Community Channel',
        created_by_id: createdById,
      },
    );

    if (!channel) {
      return;
    }

    return await channel.create();
  }

  async createChannel({ id, channelId, image, channelName, team, type }) {
    function generateId() {
      if (type == 'collaborations') {
        return channelId + id;
      }
      if (type == 'projects') {
        return channelId;
      }

      return 'unkown' + channelId;
    }
    const client = StreamChat.getInstance(
      this.configService.get<string>('PUBLIC_KEY_GETSTREAM'),
      this.configService.get<string>('PRIVATE_KEY_GETSTREAM'),
    );

    await Promise.all(
      team.map((x: string) => this.checkAccountChat({ id: x })),
    );

    const channelsAlive = await client.queryChannels({
      id: channelId || generateId(),
    });

    if (channelsAlive.length > 0) {
      const { members } = await channelsAlive[0].queryMembers({});
      const { added, deleted } = compareState(
        Object.fromEntries(members.map(({ user_id }) => [user_id, true])),
        Object.fromEntries([...team, id].map((id: string) => [id, true])),
      );

      if (deleted.length > 0) {
        await channelsAlive[0].removeMembers(deleted);
      }

      if (added.length > 0) {
        await channelsAlive[0].addMembers(added);
      }

      return { channel: channelsAlive[0].data };
    }

    let channel;

    if (channelId) {
      channel = client.channel(type, generateId(), {
        members: [...new Set([id, ...team])],
        created_by_id: id,
        ...(channelName ? { name: channelName } : {}),
        ...(image ? { image } : {}),
        data: channelId,
      });
    } else {
      channel = client.channel(type, {
        members: [...new Set([id, ...team])],
        created_by_id: id,
        ...(channelName ? { name: channelName } : {}),
        ...(image ? { image } : {}),
      });
    }

    if (!channel) return;

    //gamification token assign
    await this.userActivityService.activity(id, EventTypeEnum.START_PROJECT_CHAT)

    return await channel.create();
  }

  async registerAllAccounts() {
    const users = (await this.usersService.findAll({})) as (User & {
      _id: string;
    })[];

    return Promise.all(
      users.map(({ _id }) => {
        this.checkAccountChat({ id: _id?.toString() });
      }),
    );
  }

  async createRoomCalling(calling: CreateCallingDto) {
    const room = await this.getActiveRoom({
      user_id: null,
      user_target: calling.user_id,
    });
    if (room.length < 1) {
      return null;
    }

    let entry = await this.roomsCallsModel.findOne({
      user_id: new ObjectId(calling.user_id),
      user_target: new ObjectId(calling.user_target),
    });

    if (entry == null) {
      entry = new this.roomsCallsModel({
        ...calling,
        room_id: room[0]._id,
        last_ask: Math.floor(Date.now() / 1000) + 5,
      });
    }

    if (calling.first_ask) {
      await this.roomAccessModel.create({
        user_id: calling.user_id,
        user_target: calling.user_target,
        room_name: room[0].room_name,
        answer: 'accepted',
      });
      entry.answer = null;
    }

    entry.last_ask = Math.floor(Date.now() / 1000) + 5;
    await entry.save();

    return entry;
  }

  async getCalls(user_id: string) {
    const calls = await this.roomsCallsModel.findOne({
      user_target: user_id,
      answer: null,
      last_ask: {
        $gte: Math.floor(Date.now() / 1000),
      },
    });

    if (calls == null) {
      return;
    }

    const room = await this.getActiveRoom({
      user_id: null,
      user_target: calls.user_id,
    });
    if (room.length < 1) {
      return;
    }

    return {
      room: room[0],
      user: await this.usersService.findOne(calls.user_id?.toString()),
    };
  }

  async giveAnswerToCall(
    answer: UpdateCallingAnswer & { user_id: string },
  ): Promise<any> {
    return this.roomsCallsModel.updateOne(
      {
        user_id: new ObjectId(answer.user_target),
        user_target: new ObjectId(answer.user_id),
      },
      { answer: answer.accepted ? 'accepted' : 'recused' },
      { upsert: false },
    );
  }

  async giveAnswerToRoomAccess(answer: CreateAccessAnswer): Promise<any> {
    return this.roomAccessModel.updateOne(
      {
        user_id: new ObjectId(answer.user_id),
        user_target: new ObjectId(answer.user_target),
        room_name: answer.room_name,
      },
      { answer: answer.accepted ? 'accepted' : 'recused' },
      { upsert: true },
    );
  }

  async getAnswerForRoomAccess(ask: getAccessPermission) {
    const room = await this.roomsModel.findOne({
      room_name: ask.room_name,
      user_target: new ObjectId(ask.user_target),
      user_id: new ObjectId(ask.user_id),
    });

    if (room == null) {
      return;
    }

    const res = await this.roomAccessModel.findOne({
      room_id: room.room_id,
    });

    return res.answer;
  }

  async getAllUnAnsweredAccesses(user_id: string) {
    const room = await this.getActiveRoom({
      user_id: null,
      user_target: user_id,
    });
    if (room.length < 1) {
      return [];
    }

    return this.roomAccessModel.aggregate([
      {
        $match: {
          user_id: new ObjectId(user_id),
          room_name: room[0].room_name,
          answer: null,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_target',
          foreignField: '_id',
          as: 'user_target',
        },
      },
      {
        $unwind: '$user_target',
      },
    ]);
  }
}
