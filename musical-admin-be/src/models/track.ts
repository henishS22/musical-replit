import { App } from '@core/globals';
import { BaseModel } from '@core/database';
import { Schema, model, Model, Document } from 'mongoose';
const { ObjectId } = Schema.Types

export interface TrackDoc extends BaseModel, Document {
    name: string;
    extension: 'wav' | 'mp3' | 'm4a' | 'mp4' | 'avi' | 'zip' | 'ptx';
    user_id: string | typeof ObjectId;
    folder_id: string | typeof ObjectId;
    project_id: string | typeof ObjectId;
    instrument: typeof ObjectId[];
    genre: typeof ObjectId[];
    tags: typeof ObjectId[];
    size: number;
    duration: number;
    channels: number;
    album: string;
    lyrics?: typeof ObjectId;
    comments: string;
    rating: number;
    rate: number;
    bitrate: number;
    BPM: number;
    resolution: number;
    version: number;
    dateCreated: Date;
    url: string;
    imageWaveSmall: string;
    imageWaveBig: string;
    favorite: boolean;
    previewStart?: number;
    previewEnd?: number;
    previewExtension?: string;
    metadata_id: typeof ObjectId,
}

interface TrackModel extends Model<TrackDoc> {
    getById(id: string, projection?: any): TrackDoc | null;
    getByUserId(userId: string): TrackDoc[];
}

const TrackSchema = new Schema<TrackDoc>(
    {
        name: { type: String, required: true },
        extension: { type: String, enum: ['wav', 'mp3', 'm4a', 'mp4', 'avi', 'zip', 'ptx'], required: true },
        user_id: { type: ObjectId, ref: 'Users' },
        folder_id: { type: ObjectId },
        project_id: { type: ObjectId },
        instrument: { type: [ObjectId], ref: 'Skill_types' },
        genre: { type: [ObjectId] },
        tags: { type: [ObjectId] },
        size: { type: Number },
        duration: { type: Number },
        channels: { type: Number },
        album: { type: String },
        lyrics: { type: ObjectId, ref: 'Lyrics' },
        comments: { type: String },
        rating: { type: Number },
        rate: { type: Number },
        bitrate: { type: Number },
        BPM: { type: Number },
        resolution: { type: Number },
        version: { type: Number },
        dateCreated: { type: Date },
        url: { type: String },
        imageWaveSmall: { type: String },
        imageWaveBig: { type: String },
        favorite: { type: Boolean },
        previewStart: { type: Number },
        previewEnd: { type: Number },
        previewExtension: { type: String },
        metadata_id: { type: ObjectId },
    },
    {
        autoIndex: true,
        versionKey: false,
        timestamps: true,
    }
);

export const Track = model<TrackDoc, TrackModel>('Track', TrackSchema);
