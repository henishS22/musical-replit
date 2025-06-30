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

export type RommsCallsDocument = RoomsCalls & Document;

@Schema()
export class RoomsCalls {
  // Required props
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  user_id: ObjectId | string;

  // Required props
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  user_target: ObjectId | string;

  // Required props
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  room_id: ObjectId | string;

  @Prop({ required: true })
  last_ask: number;

  @Prop({ required: false })
  answer: 'accepted' | 'recused' | null;
}

export const RoomsCallsSchema = SchemaFactory.createForClass(RoomsCalls);
