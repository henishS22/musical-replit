import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CheckoutDocument = Checkout & Document;
import { ForeignKeyField } from '../utils/types';
import { Nft } from '.';
import * as mongoose from 'mongoose';
import { Double } from 'mongodb';

@Schema({ timestamps: true })
export class Checkout {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  nft: ForeignKeyField<Nft>;

  @Prop({ required: true })
  timestamp: string;

  @Prop()
  totalPriceUsd?: Double;

  @Prop({ required: true })
  buyer: string;

  @Prop({ required: true })
  quantityBought: number;

  @Prop({ required: true })
  contractAddress: string;

  @Prop({ required: true })
  transactionHash: string;

  @Prop({ required: true })
  blockNumber: number;
}

export const CheckoutSchema = SchemaFactory.createForClass(Checkout);
