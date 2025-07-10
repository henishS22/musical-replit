import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from '.';
import { StorageType } from '../utils/enums';
import { ForeignKeyField } from '../utils/types';
import { ObjectId } from 'mongodb';

export type UserStorageDocument = UserStorage & Document;

export class StorageAttr {
  _id: ObjectId;
  storageLimit: number;
  storageUsed: number;
  storageType: string;
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ timestamps: true })
export class Storage {
  @Prop({ required: false }) // Default storage limit: 1 GB
  storageLimit: number; // Storage limit in bytes

  @Prop({ default: 0 }) // Default used storage: 0
  storageUsed: number; // Storage used in bytes

  @Prop({ required: true, enum: StorageType })
  storageType: StorageType;

  @Prop({ default: Date.now }) // Optional: Timestamp of creation
  createdAt?: Date;
}

export const StorageSchema = SchemaFactory.createForClass(Storage);

@Schema({ timestamps: true })
export class UserStorage {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Users' }) // Unique user identifier
  userId: string;

  @Prop({required: true, default: 0})
  totalStorageUsed: number

  @Prop({ type: [StorageSchema], default: [] }) // Array of storage objects
  storage: Storage[];
}

export const UserStorageSchema = SchemaFactory.createForClass(UserStorage);
