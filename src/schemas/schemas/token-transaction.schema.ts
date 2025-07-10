import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TokenTransactionDocument = TokenTransaction & Document;
import { ForeignKeyField } from '../utils/types';
import { Nft } from '.';
import * as mongoose from 'mongoose';

export enum TokenTransactionType {
  MINT = 'mint',
  LIST = 'list',
  BUY = 'buy',
  FEE = 'fee',
  ROYALTY = 'royalty',
}

@Schema({ timestamps: true })
export class TokenTransaction {
  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId })
  nft: ForeignKeyField<Nft>;

  @Prop({ required: false })
  walletAddress?: string;

  @Prop({ required: true })
  timestamp: string;

  @Prop({
    type: String,
    enum: TokenTransactionType,
    required: true,
  })
  type: TokenTransactionType;

  @Prop({ required: false })
  tokenId?: string;

  @Prop({ required: false })
  quantity?: number;

  @Prop({ required: false })
  amount?: number;

  @Prop({ required: true, default: '' })
  contractAddress: string;

  @Prop({ required: true, default: '' })
  transactionHash: string;

  @Prop({ required: true, default: '' })
  blockNumber: number;

  @Prop({ required: true })
  user: string;
}

export const TokenTransactionSchema =
  SchemaFactory.createForClass(TokenTransaction);
