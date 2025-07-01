import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import mongoose, { Document } from 'mongoose';

export type UserActivityDocument = UserActivity & Document;

@Schema({ timestamps: true })
export class UserActivity {
    @Prop()
    eventName: string;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'GamificationEvent' })
    eventId: string | ObjectId;

    @Prop()
    points: number;

    @Prop()
    occurrence: number;

    @Prop()
    maxOccurrence: number;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    userId: string | ObjectId;
}

export const UserActivitySchema = SchemaFactory.createForClass(UserActivity);
