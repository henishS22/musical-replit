import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

export type PinataIpfsDocument = PinataIpfs & Document;

@Schema({ timestamps: true })
export class PinataIpfs {
  @Prop({ required: true })
  ipfsHash: string;

  @Prop({ required: false })
  pinSize: number;
}

export const PinataIpfsSchema = SchemaFactory.createForClass(PinataIpfs);
