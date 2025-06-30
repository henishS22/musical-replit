import { ExpoPushToken } from 'expo-server-sdk';
import { AndroidNotificationImportanceEnum, NotifyTypeEnum } from './enums';
import { Socket } from 'socket.io';

type User = {
  user_id: string;
  id: string;
  name: string;
};

export type Events = {
  type: string;
  channel_id: string;
  channel_type: string;
  members: [User];
  user: User;
  message: {
    user: User;
  };
};

export type Notification = {
  type: NotifyTypeEnum;
  title: string;
  body: string;
  image?: string;
  importance: AndroidNotificationImportanceEnum;
  payload: any;
};

export class PushToken {
  _id: string;

  token: ExpoPushToken;

  createdAt: Date;
}

export interface IMockPayload {
  value: string | object;
}

export type Content = {
  client: Socket;
  sub: string;
  associateEvents: { user: string; id: string }[];
  offSubscriptions: { route: string; event: (socket: Socket) => void }[];
};

export type EventOptions = {
  survive: string | null;
};

export type Event = { action: (socket: Socket) => void } & EventOptions;

export type Context = {
  sendMessageUser: (
    sub: string,
    event: (socket: Socket) => void,
    options?: {
      survive: boolean;
    },
  ) => void;
  addOffSubscription: (
    route: string,
    callback: (socket: Socket) => void,
  ) => void;
  cleanOffSubscription: (route: string, sub: string) => void;
  cleanOffSurvivalEvents: (route: string, sub: string) => void;
  sub: string;
  client: Socket;
};
