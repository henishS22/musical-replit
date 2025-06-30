import { Schema, model, Model, Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface MetadataDoc extends Document {
    userId: string | typeof ObjectId;
    projectId?: string | typeof ObjectId;
    isSendForRelease?: boolean;
    track: {
        artist: string;
        language: string;
        trackId: typeof ObjectId;
    };
    artist: {
        performerCredit?: string;
        writeCredit?: string;
        additionalCredit?: string;
        role?: string;
        genre: typeof ObjectId[];
    };
    collaborators?: any[];
    trackMetadata: {
        labelName?: string;
        copyrightName?: string;
        copyrightYear?: number;
        countryOfRecording?: string;
        trackISRC?: string;
        lyrics?: string;
    };
    ownership: {
        ownership: boolean;
        territories?: string;
    };
    compositionRights: {
        composerName: string;
        percentageOfOwnership: number;
        rightsManagement?: string;
    }[];
    releaseStatus: {
        previouslyReleased: boolean;
        upc?: string;
        releaseDate?: Date;
    };
}

interface MetadataModel extends Model<MetadataDoc> {
    getById(id: string, projection?: any): Promise<MetadataDoc | null>;
    getByUserId(userId: string): Promise<MetadataDoc[]>;
}

const MetadataSchema = new Schema<MetadataDoc>(
    {
        userId: { type: ObjectId, required: true, ref: 'User' },
        projectId: { type: ObjectId, ref: 'Project' },
        isSendForRelease: { type: Boolean, default: false },
        track: {
            type: {
                artist: { type: String, required: true },
                language: { type: String, required: false },
                trackId: { type: ObjectId, ref: 'Track' },
            },
            required: true,
        },
        artist: {
            type: {
                performerCredit: { type: String },
                writeCredit: { type: String },
                additionalCredit: { type: String },
                role: { type: String },
                genre: [{ type: ObjectId }],
            },
            required: true,
        },
        collaborators: { type: [Object], required: false },
        trackMetadata: {
            type: {
                labelName: { type: String },
                copyrightName: { type: String },
                copyrightYear: { type: Number },
                countryOfRecording: { type: String },
                trackISRC: { type: String },
                lyrics: { type: String },
            },
            required: true,
        },
        ownership: {
            type: {
                ownership: { type: Boolean, required: true },
                territories: { type: String },
            },
            required: true,
        },
        compositionRights: {
            type: [
                {
                    composerName: { type: String, required: true },
                    percentageOfOwnership: { type: Number, required: true },
                    rightsManagement: { type: String },
                },
            ],
            default: [],
        },
        releaseStatus: {
            type: {
                previouslyReleased: { type: Boolean, required: true },
                upc: { type: String },
                releaseDate: { type: Date },
            },
            required: true,
        },
    },
    {
        autoIndex: true,
        versionKey: false,
        timestamps: true,
    }
);

export const Metadata = model<MetadataDoc, MetadataModel>('Metadata', MetadataSchema);