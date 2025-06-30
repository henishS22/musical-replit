import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type ReleaseDocument = Release & mongoose.Document;

@Schema({ timestamps: true })
export class Release {
  @Prop({ required: true })
  name: string;
}

export const ReleaseSchema = SchemaFactory.createForClass(Release);
