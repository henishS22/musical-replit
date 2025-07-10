import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

export type PinataIpfsGroupDocument = PinataIpfsGroup & Document;

@Schema({ timestamps: true })
export class PinataIpfsGroup {
  @Prop({ required: true })
  groupCid: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  cid: string[];
}

export const PinataIpfsGroupSchema =
  SchemaFactory.createForClass(PinataIpfsGroup);
