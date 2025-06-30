import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuestDocument = Quest & Document;

@Schema({ timestamps: true })
export class Quest {
    @Prop()
    name: string;

    @Prop()
    identifier: string;

    @Prop()
    points: number;

    @Prop()
    occurrence: number;

    @Prop()
    isActive: boolean;

    @Prop()
    isPublished: boolean;

    @Prop()
    isPublishByAdmin: boolean;
}

export const QuestSchema = SchemaFactory.createForClass(Quest);