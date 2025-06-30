import { BaseModel } from '@core/database';
import { Schema, model, Model, Document } from 'mongoose';

const { ObjectId } = Schema.Types;

export interface GamificationDoc extends BaseModel, Document {
    occurrence: number;
    points: number;
    identifier: string;
    name: string;
    isActive: boolean;
}

interface GamificationModel extends Model<GamificationDoc> {
    getById(id: string, projection?: any): Promise<GamificationDoc | null>;
    getByUserId(userId: string): Promise<GamificationDoc[]>;
}

const GamificationSchema = new Schema<GamificationDoc>(
    {
        name: { type: String, required: true },
        identifier: { type: String, required: true },
        points: { type: Number, required: true },
        occurrence: { type: Number, required: true },
        isActive: { type: Boolean, default: true },
        createdById: { type: ObjectId, required: true, ref: 'Admin' },
        updatedById: { type: ObjectId, required: true, ref: 'Admin' },
    },
    {
        autoIndex: true,
        versionKey: false,
        timestamps: true,
    }
);

export const Gamification = model<GamificationDoc, GamificationModel>('GamificationEvent', GamificationSchema);