import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { Collaborator } from '../utils/types';

export type MetadataDocument = Metadata & Document;

@Schema({ timestamps: true })
export class Metadata {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    userId: string | mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Project' })
    projectId?: string | mongoose.Schema.Types.ObjectId;

    @Prop({ type: Boolean, default: false })
    isSendForRelease?: boolean;

    // Track
    @Prop({
        type: {
            artist: { type: String, required: false },
            language: { type: String, required: false },
            trackId: { type: mongoose.Schema.Types.ObjectId, ref: 'Track' },
        },
        _id: false, // Prevents `_id` in `track`
        required: true
    })
    track: {
        name: string;
        trackId: ObjectId;
    };

    // Artist
    @Prop({
        type: {
            performerCredit: { type: String, required: false },
            writeCredit: { type: String, required: false },
            additionalCredit: { type: String, required: false },
            role: { type: String, required: false },
            genre: [{ type: mongoose.Schema.Types.ObjectId }],
        },
        _id: false, // Prevents `_id` in `artist`
        required: true
    })
    artist: {
        performerCredit?: string;
        writeCredit?: string;
        additionalCredit?: string;
        role?: string;
        genre: ObjectId[];
    };

    // Collaborators
    @Prop({ required: false, type: [Object] })
    collaborators: any[];

    // Metadata Track
    @Prop({
        type: {
            labelName: { type: String, required: false },
            copyrightName: { type: String, required: false },
            copyrightYear: { type: Number, required: false },
            countryOfRecording: { type: String, required: false },
            trackISRC: { type: String, required: false },
            lyrics: { type: String, required: false },
        },
        _id: false, // Prevents `_id` in `trackMetadata`
        required: true
    })
    trackMetadata: {
        labelName?: string;
        copyrightName?: string;
        copyrightYear?: number;
        countryOfRecording?: string;
        trackISRC?: string;
        lyrics?: string;
    };

    // Ownership
    @Prop({
        type: {
            ownership: { type: Boolean, required: true },
            territories: { type: String, required: false },
        },
        _id: false, // Prevents `_id` in `ownership`
        required: true
    })
    ownership: {
        ownership: boolean;
        territories?: string;
    };

    // Composition Rights
    @Prop({
        type: [
            {
                composerName: { type: String, required: true },
                percentageOfOwnership: { type: Number, required: true },
                rightsManagement: { type: String, required: false }
            }
        ],
        _id: false, // Prevents `_id` in each element of `compositionRights`
        default: []
    })
    compositionRights: {
        composerName: string;
        percentageOfOwnership: number;
        rightsManagement?: string;
    }[];

    // Release Status
    @Prop({
        type: {
            previouslyReleased: { type: Boolean, required: true },
            upc: { type: String, required: false },
            releaseDate: { type: Date, required: false },
        },
        _id: false, // Prevents `_id` in `releaseStatus`
        required: true
    })
    releaseStatus: {
        previouslyReleased: boolean;
        upc?: string;
        releaseDate?: Date;
    };
}

export const MetadataSchema = SchemaFactory.createForClass(Metadata);