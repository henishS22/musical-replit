import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';

export class PostIds {
  status: string;
  id: string;
  postUrl: string;
  platform: string;
}

export class YouTubeOptions {
  title: string;
  visibility: string;
  thumbNail?: string;
  tags: Array<String>;
}

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true, type: ObjectId, ref: 'users' })
  userId: ObjectId;

  @Prop({ required: true })
  profileKey: string;

  @Prop({ required: true })
  profileTitle: string

  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  refId: string;

  @Prop({ required: true })
  type: string;

  @Prop()
  scheduleDate?: Date;

  @Prop()
  platforms: Array<String>;

  @Prop()
  postIds: PostIds

  @Prop({ required: true })
  post: string

  @Prop()
  youTubeOptions?: YouTubeOptions

  @Prop()
  mediaUrls: string[]

  @Prop()
  errors: Array<Object> | Array<[]>

  @Prop({ required: true })
  status: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);
