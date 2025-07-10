import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export type ApplicationsDocument = Applications & Document;

@Schema({ timestamps: true })
export class Applications {
  @Prop({ required: true })
  brief: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: string | ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'Projects',
  })
  projectId: string | ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Track' })
  track: string | ObjectId;
}

export const ApplicationsSchema = SchemaFactory.createForClass(Applications);
