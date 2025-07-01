import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import mongoose, { Document } from 'mongoose';

export type EventTransactionDocument = EventTransaction & Document;

@Schema({ timestamps: true })
export class EventTransaction {
    @Prop()
    eventName: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, })
    eventId: string | ObjectId;

    @Prop()
    points: number;

    @Prop()
    occurrence: number;

    @Prop()
    maxOccurrence: number;

    @Prop({ required: true, default: false })
    isQuest: boolean;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    userId: string | ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Quest' })
    questId: string | ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'CreatorQuest' })
    creatorQuestId: string | ObjectId;
}

export const EventTransactionSchema = SchemaFactory.createForClass(EventTransaction);
