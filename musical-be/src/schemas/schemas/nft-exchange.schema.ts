import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NftExchangeDocument = NftExchange & Document;
import { ForeignKeyField } from '../utils/types';
import { Nft, User } from '.';
import * as mongoose from 'mongoose';

export enum NftExchangeStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
  REMOVED = 'removed',
}

@Schema({ timestamps: true })
class UserObj {
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  id?: ForeignKeyField<User>;

  @Prop({ type: mongoose.Schema.Types.ObjectId })
  nft?: ForeignKeyField<Nft>;

  @Prop({ required: true })
  walletAddress: string;

  @Prop({ default: false })
  isApproved: boolean;

  @Prop()
  tokenId?: string;

  @Prop()
  quantity?: number;
}

@Schema({ timestamps: true })
export class NftExchange {
  // @Prop({ type: mongoose.Schema.Types.ObjectId })
  // nft?: ForeignKeyField<Nft>;

  @Prop({ type: UserObj, required: true })
  user1: UserObj;

  @Prop({ type: UserObj })
  user2?: UserObj;

  @Prop({ required: true })
  timestamp: string;

  @Prop({ required: true })
  exchangeId: number;

  @Prop({
    type: String,
    enum: NftExchangeStatus,
    required: true,
    default: NftExchangeStatus.PENDING,
  })
  status: NftExchangeStatus;
}

export const NftExchangeSchema = SchemaFactory.createForClass(NftExchange);
