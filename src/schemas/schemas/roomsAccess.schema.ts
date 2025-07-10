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

export type RoomsAccessDocument = RoomsAccess & Document;

@Schema()
export class RoomsAccess {
  // Required props
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  user_id: ObjectId | string;

  // Required props
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  user_target: ObjectId | string;

  // Required props
  @Prop({ required: true })
  room_name: string;

  @Prop({ required: false })
  answer: 'accepted' | 'recused' | null;
}

export const RoomsAccessSchema = SchemaFactory.createForClass(RoomsAccess);
