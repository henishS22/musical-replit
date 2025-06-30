import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Project, Track, User, Nft, UserDocument } from '.';
import * as mongoose from 'mongoose';
import { StatusReleaseEnum } from '../utils/types';
import { ForeignKeyField } from '../utils/types';

export type ReleaseDocument = Release & Document;

export class Contracts {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: ForeignKeyField<UserDocument>;

  @Prop({ required: true })
  split: number;

  @Prop({ required: true, default: false })
  accepted: boolean;

  @Prop({ required: false, default: '' })
  address?: string;
}

export class FundDistribution {
  @Prop({ required: true, default: '' })
  date: string;

  @Prop({ required: true, default: '' })
  totalDistributed: string;

  @Prop({ required: false, default: '' })
  blockHash: string;

  @Prop({ required: false, default: '' })
  transactionHash: string;
}

@Schema({ timestamps: true })
export class Release {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: ForeignKeyField<User>;

  @Prop({ required: true })
  name: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  })
  project: ForeignKeyField<Project>;

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

  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: 'Nft' })
  nft: ForeignKeyField<Nft>;

  @Prop({ required: true, type: [Object] })
  contracts: Contracts[];

  @Prop({
    required: true,
    enum: StatusReleaseEnum,
    type: mongoose.Schema.Types.String,
  })
  status: StatusReleaseEnum;

  @Prop({ required: false, type: mongoose.Schema.Types.String, default: '' })
  splitContractAddress?: string;

  @Prop({ required: false, type: mongoose.Schema.Types.String, default: '' })
  editionContractAddress?: string;

  @Prop({ required: false, type: [Object], default: [] })
  fundDistributions?: FundDistribution[];

  @Prop({ required: false, type: Object })
  tracksIpfsIds: {
    [x: string]: string;
  };

  @Prop({ required: false })
  isTokenGateKey: boolean;
}

export const ReleaseSchema = SchemaFactory.createForClass(Release);
