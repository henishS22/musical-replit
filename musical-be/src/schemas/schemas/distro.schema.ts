import { DistroStatus } from '@/src/distro/dto/distro.dto';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';

export type DistroDocument = Distro & Document;

@Schema({ timestamps: true })
export class Distro {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    userId: string;

    @Prop({ required: true })
    userName: string;

    @Prop()
    spotify?: string;

    @Prop()
    youtube?: string;

    @Prop()
    tiktok?: string;

    @Prop()
    apple?: string;

    @Prop()
    instagram?: string;

    @Prop()
    x?: string;

    @Prop()
    message?: string;

    @Prop({ type: String, enum: DistroStatus, default: DistroStatus.PENDING })
    status: DistroStatus;
}

export const DistroSchema = SchemaFactory.createForClass(Distro);
