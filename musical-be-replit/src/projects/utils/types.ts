import { Prop } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';
import { User, Project, Release, Track } from '../../schemas/schemas';
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

export class I18nDocument {
  @Prop()
  en: string;

  @Prop()
  es: string;
}
