import { App } from '@core/globals';
import { BaseModel } from '@core/database';
import { Schema, model, Model, Document } from 'mongoose';
const { ObjectId } = Schema.Types

export interface TrackProjectDoc extends BaseModel, Document {
    trackId: string | typeof ObjectId
    projectId: string | typeof ObjectId
}

interface TrackProjectModel extends Model<TrackProjectDoc> {
    getById(id: string, projection?: any): TrackProjectDoc | null;
    getByUserId(userId: string): TrackProjectDoc[];
}

const TrackProjectSchema = new Schema<TrackProjectDoc>(
    {
        trackId: { type: ObjectId, ref: 'Tracks' },
        projectId: { type: ObjectId, ref: 'Project' },

    },
    {
        autoIndex: true,
        versionKey: false,
        timestamps: true,
    }
);

export const TrackProject = model<TrackProjectDoc, TrackProjectModel>('tracks_projects', TrackProjectSchema);
