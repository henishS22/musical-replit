import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GamificationEventDocument = GamificationEvent & Document;

@Schema({ timestamps: true })
export class GamificationEvent {
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
}

export const GamificationEventSchema = SchemaFactory.createForClass(GamificationEvent);
