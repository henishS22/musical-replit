import { Prop } from '@nestjs/mongoose';
import { NewActivity as BaseNewActivity } from 'getstream';
import { ActivityTypeEnum, ReactionsTypes } from './enums';
import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';
import { User } from '../schemas/user.schema';

export type ForeignKeyField<T> =
  | string
  | mongoose.Schema.Types.ObjectId
  | mongoose.ObjectId
  | ObjectId
  | T;

export class Collaborator {
  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user?: ForeignKeyField<User>;

  @Prop({ required: false })
  email?: string;

  @Prop({ required: false, default: false })
  invitedForProject?: boolean;
}

export interface IMockPayload {
  value: string | object;
}

export type NewActivity = BaseNewActivity & {
  verb: ActivityTypeEnum;
};

export type FeedGroup = string;

export type FeedFollow = {
  feedId: string;
  feedGroup: FeedGroup;
};

export type GetActivitiesOptions = {
  limit?: number;
  afterId?: string;
  types?: ActivityTypeEnum[];
};

export type ReactionResult = {
  id: string;
  userId: string;
  activityId: string;
  time: string;
};

export type CommentResult = ReactionResult & {
  comment: string;
};

export type ChangeReactionResult = {
  reaction?: ReactionsTypes;
  id?: string;
  userId?: string;
  activityId?: string;
  time?: string;
};

export type APIChangeSimpleReactionResponse = {
  reaction?: ReactionsTypes | null;
  id?: string;
  user_id?: string;
  activity_id?: string;
  created_at?: string;
};

export type UserHasReactionOnActivityOptions = {
  userId: string;
  activityId: string;
};

export class I18nDocument {
  @Prop()
  en: string;

  @Prop()
  es: string;
}

export type ActivityResult = {
  id: string;
  actor: User;
  target: any;
  resource: any;
  time: string;
  type: ActivityTypeEnum;
  extra: any;
  reaction_counts: {
    [key in ReactionsTypes]: number;
  };
  own_reactions: [{ reaction: any }];
};
