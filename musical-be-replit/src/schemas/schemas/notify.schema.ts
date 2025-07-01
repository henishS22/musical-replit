import * as mongoose from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';
import { NotifyTypeEnum } from '../utils/enums';

export type NotifyDocument = Notify & Document;

@Schema({ timestamps: true })
export class Notify {
  // Notify type
  @Prop({
    required: true,
    enum: NotifyTypeEnum,
    type: mongoose.Schema.Types.String,
  })
  type: NotifyTypeEnum;

  // Who generated this notify
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  from: string | ObjectId;

  // Who will be notify
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  to: string | ObjectId;

  // Which resource is envolved in this action
  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId })
  resource: string | ObjectId;

  // If notify was viewed
  @Prop({ required: true })
  viewed: boolean;

  // A optional identifier for external ids
  @Prop({ required: false })
  identifier: string;

  @Prop({ required: false, type: mongoose.Schema.Types.Map })
  data: Record<string, any>;
}

export const NotifySchema = SchemaFactory.createForClass(Notify);
