/**
 *  @file User follow schema, to store users following other users. Create and exports a moongose document definition
 *  @author Rafael Marques Siqueira
 *  @exports UserFollowDocument
 *  @exports UserFollow
 *  @exports UserFollowSchema
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export type UserFollowDocument = UserFollow & Document;

// Define timestamps true to save createdAt and updatedAt dates
@Schema({ timestamps: true })
export class UserFollow {
  //// Follower user
  @Prop({ required: true, index: true })
  follower: ObjectId;

  //// Followed user
  @Prop({ required: true, index: true })
  followed: ObjectId;
}

export const UserFollowSchema = SchemaFactory.createForClass(UserFollow);

//Define custom index to avoid the duplicated pair of follower/followed
UserFollowSchema.index({ follower: 1, followed: 1 }, { unique: true });
