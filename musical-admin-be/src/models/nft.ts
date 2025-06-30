import { App } from '@core/globals';
import { BaseModel } from '@core/database';
import mongoose, { Schema, model, Model, Document } from 'mongoose';

const { ObjectId } = Schema.Types;

export interface TracksIpfsIds {
    id: string;
    cid: string;
}

export interface TCustomSettings {
    mainBackground?: string;
    textColor?: string;
    background1?: string;
    background2?: string;
    background3?: string;
    background4?: string;
    background5?: string;
    background6?: string;
    background7?: string;
}

interface Contracts {
    user: typeof ObjectId;
    split: number;
    accepted: boolean;
    address?: string;
}

export interface NftDoc extends BaseModel, Document {
    userId: string | typeof ObjectId;
    userName: string;
    spotify?: string;
    youtube?: string;
    tiktok?: string;
    apple?: string;
    instagram?: string;
    x?: string;
    message?: string;

    project: typeof ObjectId;
    user: typeof ObjectId;
    release?: typeof ObjectId;
    checkoutUrl?: string;
    checkoutUrlId?: string;
    checkoutUrlImageExpiry?: Date;
    editionContractAddress?: string;
    splitContractAddress?: string;
    listingId?: string;
    tokenId?: number;
    listedAt?: Date;
    title: string;
    description?: string;
    initialSupply: number;
    price?: string;
    artworkExtension?: 'bmp' | 'jpeg' | 'png';
    artworkUrl?: string;
    tracksIpfsIds?: TracksIpfsIds;
    customSettings?: TCustomSettings;
    chainId: string;
    wallet: string;
    quantityPurchased?: number;
    timesPurchased?: number;
    contracts: Contracts[];
    selectedTracks?: typeof ObjectId[];
    finalVersions?: typeof ObjectId[];
    transactionHash?: string;
    tokenUri?: string;
}

interface NftModel extends Model<NftDoc> { }

const NftSchema = new Schema<NftDoc>(
    {
        userId: { type: ObjectId, required: true, ref: 'User' },
        userName: { type: String, required: true },
        spotify: { type: String },
        youtube: { type: String },
        tiktok: { type: String },
        apple: { type: String },
        instagram: { type: String },
        x: { type: String },
        message: { type: String },

        project: { type: ObjectId, required: true, ref: 'Project' },
        user: { type: ObjectId, required: true, ref: 'User' },
        release: { type: ObjectId, ref: 'Release' },
        checkoutUrl: { type: String },
        checkoutUrlId: { type: String },
        checkoutUrlImageExpiry: { type: Date },
        editionContractAddress: { type: String },
        splitContractAddress: { type: String },
        listingId: { type: String },
        tokenId: { type: Number },
        listedAt: { type: Date },
        title: { type: String, required: true },
        description: { type: String },
        initialSupply: { type: Number, required: true },
        price: { type: String },
        artworkExtension: { type: String, enum: ['bmp', 'jpeg', 'png'] },
        artworkUrl: { type: String },
        tracksIpfsIds: {
            id: { type: String },
            cid: { type: String },
        },
        customSettings: {
            mainBackground: { type: String },
            textColor: { type: String },
            background1: { type: String },
            background2: { type: String },
            background3: { type: String },
            background4: { type: String },
            background5: { type: String },
            background6: { type: String },
            background7: { type: String },
        },
        chainId: { type: String, required: true },
        wallet: { type: String, required: true },
        quantityPurchased: { type: Number, default: 0 },
        timesPurchased: { type: Number, default: 0 },
        contracts: [
            {
                user: { type: ObjectId, required: true, ref: 'User' },
                split: { type: Number, required: true },
                accepted: { type: Boolean, default: true },
                address: { type: String, default: '' },
            },
        ],
        selectedTracks: [{ type: ObjectId, ref: 'Track' }],
        finalVersions: [{ type: ObjectId, ref: 'Track' }],
        transactionHash: { type: String },
        tokenUri: { type: String },
    },
    {
        autoIndex: true,
        versionKey: false,
        timestamps: true,
    }
);

export const Nft = model<NftDoc, NftModel>('Nft', NftSchema);
