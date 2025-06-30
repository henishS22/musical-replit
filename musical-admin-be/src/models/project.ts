import { Schema, model, Model, Document } from 'mongoose'
import { BaseModel } from '@core/database'
const { ObjectId } = Schema.Types

export interface projectAttrs {
	user: string
	ownerRoles: string
	name: string
	artworkExension: string
	artworkUrl: string
	splitModel: string
	split: number
	type: string
	collaborators?: {
		user: typeof ObjectId
		email: string
		invitedForProject:boolean
		roles: string[]
		permission: string
		split: string
	}
	youtube: string
	spotify: string
	coverExtension: string
	coverImageUrl: string
	isPublic: boolean
	updates: typeof ObjectId
	lyrics: string
	deadline: string
}

export interface ProjectDoc extends BaseModel, Document {
	id: typeof ObjectId
	user: typeof ObjectId
	ownerRoles: string
	name: string
	artworkExension: string
	artworkUrl: string
	splitModel: string
	split: number
	type: string
	collaborators?: {
		user: typeof ObjectId
		email: string
		invitedForProject:boolean
		roles: string[]
		permission: string
		split: string
	}
	youtube: string
	spotify: string
	coverExtension: string
	coverImageUrl: string
	isPublic: boolean
	updates: typeof ObjectId
	lyrics: string
	deadline: string
}

export interface ProjectUpdate {
	release: string
	type: string
	info: string
	user: string
	createdAt: Date
}

const projectSchema = new Schema<ProjectDoc>(
	{

		user: { type: ObjectId },
		ownerRoles: { type: String },
		name: { type: String },
		artworkExension: { type: String },
		artworkUrl: { type: String },
		splitModel: { type: String },
		split: { type: Number },
		type: { type: String },
		collaborators: {
			type: ObjectId,
			ref: 'Collection',
		},
		youtube: { type: String },
		spotify: { type: String },
		coverExtension: { type: String },
		coverImageUrl: { type: String },
		isPublic: { type: Boolean, default: false },
		updates: {
			release: String,
			type: String,
			info: String,
			user: String,
			createdAt: Date,
		},
		lyrics: String,
		deadline: { type: String },
	},
	{
		autoIndex: true,
		versionKey: false,
		timestamps: true,
	}
)

interface ProjectModel extends Model<ProjectDoc> {
	build(attrs: projectAttrs): ProjectDoc
}

export const Project = model<ProjectDoc, ProjectModel>('Project', projectSchema)
