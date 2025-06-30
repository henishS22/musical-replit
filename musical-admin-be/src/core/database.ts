import { Logger } from '@core/globals'
import { connect, Schema } from 'mongoose'
const ObjectId = Schema.Types.ObjectId

export interface BaseModel {
	isDeleted: boolean
	createdAt?: Date
	updatedAt?: Date
	createdById?: typeof ObjectId
	updatedById?: typeof ObjectId
}

export class Database {
	private url: string

	constructor(options: { url: string }) {
		const { url } = options

		this.url = url
	}

	async connect(): Promise<void> {
		await connect(this.url.toString())
		Logger.info('Database Connected Successfully')
	}
}
