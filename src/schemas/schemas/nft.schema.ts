import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NftDocument = Nft & Document;
import { ForeignKeyField } from '../utils/types';
import { Project, Release, User, Track, UserDocument } from '.';
import * as mongoose from 'mongoose';

export class TracksIpfsIds {
  id: string;
  cid: string;
}

export class TCustomSettings {
  @Prop({ required: false })
  mainBackground?: string;

  @Prop({ required: false })
  textColor?: string;

  @Prop({ required: false })
  background1?: string;

  @Prop({ required: false })
  background2?: string;

  @Prop({ required: false })
  background3?: string;

  @Prop({ required: false })
  background4?: string;

  @Prop({ required: false })
  background5?: string;

  @Prop({ required: false })
  background6?: string;

  @Prop({ required: false })
  background7?: string;
}

class Contracts {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: ForeignKeyField<UserDocument>;

  @Prop({ required: true })
  split: number;

  @Prop({ required: true, default: true })
  accepted: boolean;

  @Prop({ required: false, default: '' })
  address?: string;
}

@Schema({ timestamps: true })
export class Nft {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  project: ForeignKeyField<Project>;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  user: ForeignKeyField<User>;

  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId })
  release: ForeignKeyField<Release>;

  @Prop({ required: false })
  checkoutUrl: string;

  @Prop({ required: false })
  checkoutUrlId: string;

  @Prop({ required: false })
  checkoutUrlImageExpiry: Date;

  @Prop({ required: false })
  editionContractAddress: string;

  @Prop({ required: false })
  splitContractAddress: string;

  @Prop({ required: false })
  listingId: string;

  @Prop({ required: false })
  tokenId: number;

  @Prop({ required: false, type: mongoose.Schema.Types.Date })
  listedAt: Date;

  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: true })
  initialSupply: number;

  @Prop({ required: false })
  price: string;

  @Prop({ required: false, type: mongoose.Schema.Types.String })
  artworkExtension: 'bmp' | 'jpeg' | 'png';

  @Prop({ required: false })
  artworkUrl: string;

  @Prop({ required: false })
  tracksIpfsIds: TracksIpfsIds;

  @Prop({ required: false })
  customSettings: TCustomSettings;

  @Prop({ required: true })
  chainId: string;

  @Prop({ required: true })
  wallet: string;

  @Prop({ required: false, default: 0 })
  quantityPurchased: number;

  @Prop({ required: false, default: 0 })
  timesPurchased: number;

  @Prop({ required: true, type: [Object] })
  contracts: Contracts[];

  @Prop({
    required: false,
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }],
  })
  selectedTracks: ForeignKeyField<Track>[];

  @Prop({
    required: false,
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }],
  })
  finalVersions: ForeignKeyField<Track>[];

  @Prop({ required: false })
  transactionHash: string;

  @Prop({ required: false })
  tokenUri: string;
}

export const NftSchema = SchemaFactory.createForClass(Nft);
