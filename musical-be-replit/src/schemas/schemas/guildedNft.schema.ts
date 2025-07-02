import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type GuildedNftDocument = GuildedNft & Document;
import { ForeignKeyField } from '../utils/types';
import { User, UserDocument } from '.';
import * as mongoose from 'mongoose';

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
export class GuildedNft {
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
    user: ForeignKeyField<User>;

    @Prop({ required: false })
    listingId: string;

    @Prop({ required: false })
    tokenId: number;

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

    @Prop({ required: false })
    transactionHash: string;

    @Prop({ required: false })
    tokenUri: string;

    @Prop({ required: false, default: false })
    isFirstTimeBuy: boolean;

    @Prop({ required: false, default: false })
    bought: boolean;

    @Prop({ required: false, default: false })
    isRegisterForAirDrop: boolean;

    @Prop({ required: false })
    isGuildedNFT: boolean;

    @Prop({ required: false })
    ethereumPrice: Number;

    @Prop({ required: false })
    maticPrice: Number;

    @Prop({ required: false })
    priceInUsd: Number;
}

export const GuildedNftSchema = SchemaFactory.createForClass(GuildedNft);
