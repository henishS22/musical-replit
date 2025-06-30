import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';
import { Prop } from '@nestjs/mongoose';
import { PermissionProjectEnum } from './enums';
import { User } from '@/src/schemas/schemas';

/**
 *  @file Utils file for types definition for Nfts module
 *  @author Rafael Marques Siqueira
 *  @exports ImageFileType
 *  @exports TransportImageType
 */

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

export interface IMockPayload {
  value: string | object;
}

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
