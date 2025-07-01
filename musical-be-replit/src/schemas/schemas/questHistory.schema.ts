import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import mongoose, { Document } from 'mongoose';
export type QuestHistoryDocument = QuestHistory & Document;

@Schema({ timestamps: true })
export class QuestHistory {
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Quest' })
    questId: string | ObjectId;

    @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: 'CreatorQuest' })
    creatorQuestId: string | ObjectId;

    @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    userId: string | ObjectId;

    @Prop()
    points: number;

    @Prop()
    occurrence: number;

    @Prop()
    maxOccurrence: number;

}

export const QuestHistorySchema = SchemaFactory.createForClass(QuestHistory);