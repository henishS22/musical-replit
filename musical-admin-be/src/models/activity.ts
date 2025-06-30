import { Schema, model, Model, Document } from 'mongoose'
import { BaseModel } from '@core/database'

const { ObjectId } = Schema.Types

export interface ActivityAttrs {
	activities: string[]
	userId: typeof ObjectId
	roleId: typeof ObjectId
}

// TS Schema
export interface ActivityDoc extends Document, BaseModel {
	id: typeof ObjectId
	activities: string[]
	userId: typeof ObjectId
	roleId: typeof ObjectId
}

interface ActivityModel extends Model<ActivityDoc> {
	build(attrs: ActivityAttrs): ActivityDoc
}

const activitySchema = new Schema<ActivityDoc>(
	{
		activities: [],
		userId: { type: ObjectId, ref: 'User' },
		roleId: { type: ObjectId, ref: 'Role' },
	},
	{
		autoIndex: true,
		versionKey: false,
		timestamps: true,
	}
)

export const Activity = model<ActivityDoc, ActivityModel>('Activity', activitySchema)

// Static Methods
// Function to create a new Item
activitySchema.statics.build = async (attrs: ActivityAttrs) => {
	const activity = new Activity(attrs)
	await activity.save()
	return activity
}
