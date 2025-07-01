import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import {
  AndroidNotificationImportanceEnum,
  NotifyTypeEnum,
} from '../utils/enums';

export type NotificationFormatDocument = NotificationFormat & Document;

@Schema({ timestamps: true })
export class NotificationFormat {
  @Prop({
    required: true,
    enum: NotifyTypeEnum,
    type: mongoose.Schema.Types.String,
  })
  type: NotifyTypeEnum;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  /**
   * Android only.
   */
  @Prop({
    required: true,
    enum: AndroidNotificationImportanceEnum,
    type: mongoose.Schema.Types.String,
  })
  importance: AndroidNotificationImportanceEnum;
}

export const NotificationFormatSchema =
  SchemaFactory.createForClass(NotificationFormat);
