import { Prop } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { User, Project, Release, Track } from '../schemas';
import { PermissionProjectEnum, ProjectUpdateEnum } from './enums';

export class Collaborator {
  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user?: ForeignKeyField<User>;

  @Prop({ required: false })
  email?: string;

  @Prop({ required: false, default: false })
  invitedForProject?: boolean;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'skill_types',
  })
  roles: string | mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, enum: PermissionProjectEnum })
  permission: string;

  @Prop({ required: false })
  split?: number;
}

//Defines file type for file upload
export type ImageFileType = {
  mimetype: 'image/bmp' | 'image/jpeg' | 'image/png';
  buffer: Buffer;
  size: number;
};

//Defines the image type to be used to transfer data between services
export type TransportImageType = {
  mimetype: 'image/bmp' | 'image/jpeg' | 'image/png';
  fileCacheKey: string;
  size: number;
};

export type ForeignKeyField<T> =
  | string
  | mongoose.Schema.Types.ObjectId
  | mongoose.ObjectId
  | ObjectId
  | T;

export type CreateProjectUpdate = {
  type: ProjectUpdateEnum;
  release?: ObjectId;
  project: ObjectId;
  info?: any;
  userId: ObjectId;
};

export type GetProjectDetailPaylod = {
  project: Project & { _id?: string };
  releases?: Release[];
  tracks?: Track[];
};

export type SkillsObjectType = {
  skills_type_info: {
    _id: string;
    type: string;
    title: { [key: string]: string };
  }[];
  skills_level_info: {
    _id: string;
    level: string;
    title: { [key: string]: string };
  }[];
};

export class I18nDocument {
  @Prop()
  en: string;

  @Prop()
  es: string;
}

export class CountryName {
  @Prop({ required: true })
  english: string;

  @Prop({ required: true })
  native: string;
}

export type Localization = {
  country: { name: string };
  state: { name: string };
  city: { name: string };
};

export type ArtistSearch = {
  query?: string;
  sort?: boolean;
  skills?: string[];
  styles?: string[];
  page?: number;
  limit?: number;
};

export interface IMockPayload {
  value: string | object;
}

export enum InviteStatusEnum {
  AVAILABLE = 'AVAILABLE',
  USED = 'USED',
  SEND = 'SEND',
  COPY = 'COPY',
}

export enum StatusReleaseEnum {
  'IN_PROGRESS' = 'IN_PROGRESS',
  'FINISHED' = 'FINISHED',
}

export enum RolesEnum {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum Provider {
  'Metamask',
  'Coinbase',
}
