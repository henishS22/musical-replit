import { App } from '@core/globals';
import { BaseModel } from '@core/database';
import { Schema, model, Model, Document } from 'mongoose';

const { ObjectId } = Schema.Types;

export enum DistroStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export interface DistroDoc extends BaseModel, Document {
    userId: string | typeof ObjectId;
    userName: string;
    spotify?: string;
    youtube?: string;
    tiktok?: string;
    apple?: string;
    instagram?: string;
    x?: string;
    message?: string;
    status: DistroStatus;
}

interface DistroModel extends Model<DistroDoc> {
    getById(id: string, projection?: any): Promise<DistroDoc | null>;
    getByUserId(userId: string): Promise<DistroDoc[]>;
}

const DistroSchema = new Schema<DistroDoc>(
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
        status: { type: String, enum: Object.values(DistroStatus), required: true },
    },
    {
        autoIndex: true,
        versionKey: false,
        timestamps: true,
    }
);

export const Distro = model<DistroDoc, DistroModel>('Distro', DistroSchema);
