/**
 *  @file Schema sample file. Create and exports a moongose document definition
 *  @author Rafael Marques Siqueira
 *  @exports RoomsDocument
 *  @exports Room
 *  @exports RoomSchema
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export type RoomsDocument = Room & Document;

@Schema()
export class Room {
  // Required props
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  user_id: ObjectId | string;

  @Prop({ required: true })
  room_id: string;

  @Prop({ required: true })
  room_url: string;

  @Prop({ required: true })
  room_name: string;

  @Prop({ required: true })
  privacy: string;

  @Prop({ required: false, select: false })
  token: string;

  @Prop({ required: true })
  max_participants: number;

  @Prop({ required: true })
  exp: number;

  @Prop({ required: true })
  users_request_acess: [ObjectId];
}

export const RoomSchema = SchemaFactory.createForClass(Room);
