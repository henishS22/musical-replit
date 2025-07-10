// src/live-stream/schemas/live-stream.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { LiveStreamType, AccessControl } from '../../stream/dto/create-stream.dto';
import * as mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

@Schema({ timestamps: true })
export class LiveStream extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true, enum: LiveStreamType })
  type: LiveStreamType;

  @Prop({ required: true, enum: AccessControl })
  accessControl: AccessControl;

  @Prop()
  artworkUrl?: string;

  @Prop()
  scheduleDate?: Date;

  @Prop()
  chatId: string | null;

  @Prop()
  streamId?: string | null;

  @Prop()
  streamUrl?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  createdById: string | ObjectId;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Nft' }])
  nftIds?: (string | ObjectId)[];

  @Prop({ default: 'scheduled', enum: ['scheduled', 'live', 'completed'] })
  status: string;

  @Prop()
  isEverLive: boolean;
}

export const LiveStreamSchema = SchemaFactory.createForClass(LiveStream);
