import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import mongoose, { Document } from 'mongoose';

export type LeaderboardDocument = Leaderboard & Document;

@Schema({ timestamps: true })
export class Leaderboard {
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    userId: string | ObjectId;

    @Prop()
    questPerformed: number;

    @Prop()
    questPoints: number;

    @Prop()
    eventPerformed: number;

    @Prop()
    eventPoints: number;

    @Prop()
    points: number;
}

export const LeaderboardSchema = SchemaFactory.createForClass(Leaderboard);
