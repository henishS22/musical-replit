import { BaseModel } from '@core/database';
import { Schema, model, Model, Document, ObjectId } from 'mongoose';

const { ObjectId } = Schema.Types;

export interface UserActivityDoc extends BaseModel, Document {
    eventName: string;
    points: number;
    occurrence: number;
    maxOccurrence: number;
    eventId: ObjectId
    userId: ObjectId
}

interface UserActivityModel extends Model<UserActivityDoc> {
    getById(id: string, projection?: any): Promise<UserActivityDoc | null>;
    getByUserId(userId: string): Promise<UserActivityDoc[]>;
}

const UserActivitySchema = new Schema<UserActivityDoc>(
    {
        eventName: { type: String, required: true },
        points: { type: Number, required: true },
        occurrence: { type: Number, required: true },
        maxOccurrence: { type: Number, required: true },
        eventId: { type: ObjectId, required: true, ref: 'GamificationEvent' },
        userId: { type: ObjectId, required: true, ref: 'User' },
    },
    {
        autoIndex: true,
        versionKey: false,
        timestamps: true,
    }
);

export const UserActivity = model<UserActivityDoc, UserActivityModel>('UserActivity', UserActivitySchema);