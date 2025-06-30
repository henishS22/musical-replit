import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ForumDocument = Forum & Document;

@Schema({ timestamps: true })
export class Forum {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description: string;

}

export const ForumSchema = SchemaFactory.createForClass(Forum);
