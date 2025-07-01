import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Comment } from './comment.schema';
import * as mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export type TopicDocument = Topic & Document;

@Schema({ timestamps: true })
export class Topic {
  @Prop({ required: true })
  title: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Forum', required: true })
  forumId: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: string | ObjectId;;

  @Prop({ default: 0 })
  viewCount: number;

  @Prop({ type: [{ type: String }] }) 
  participants: string[];

  @Prop({ default: 0 })
  repliesCount: number;

  @Prop({ default: Date.now })
  lastActivity: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false })
  lastReplyFrom?:string | ObjectId;;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Comment' }] })
  comments: Types.ObjectId[];

  @Prop()
  createdAt:Date
}

export const TopicSchema = SchemaFactory.createForClass(Topic);
