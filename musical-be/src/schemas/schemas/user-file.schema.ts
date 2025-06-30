import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

export type UserFileDocument = UserFile & Document;

@Schema({ timestamps: true })
export class UserFile {
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'users' })
    userId: mongoose.Types.ObjectId;

    @Prop({ required: true })
    fileName: string;

    @Prop({ required: false })
    key: string;

    @Prop({ required: true })
    bucket: string;

    @Prop({ required: true })
    fileSize: number
    
    @Prop({ required: true, enum: ['artwork', 'big', 'small', 'track', 'cover_image', 'preview'] })
    file: string

    @Prop({ required: true, enum: ['track', 'project', 'collab', 'stream', 'user'] })
    fileFor: string

    @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: 'tracks' })
    track_id: mongoose.Types.ObjectId

    @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: 'projects' })
    project_id: mongoose.Types.ObjectId

    @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: 'livestreams' })
    stream_id: mongoose.Types.ObjectId

    @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: 'collaborations' })
    colab_id: mongoose.Types.ObjectId

    @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: 'users' })
    user_id: mongoose.Types.ObjectId
}

export const UserFileSchema =
    SchemaFactory.createForClass(UserFile);