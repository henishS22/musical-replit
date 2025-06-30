import { UserInputError } from 'apollo-server-errors'
import { MongoDataSource } from 'apollo-datasource-mongodb'
import { Logger } from '@core/globals'
import { checkFlag } from '@helpers/mongoose'
import { AdminDoc, AdminSchemaDoc } from '@models/admin'

export default class AuthDataSource extends MongoDataSource<AdminSchemaDoc> {
	constructor(Admin) {
		super(Admin)
	}

	public async getUserForAuth(query): Promise<AdminDoc> {
		Logger.info('Inside getUser Datasource Service')
		try {
			return this.model.findOne(query, '+password +verification')
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}

	public async checkExistingUser(query) {
		Logger.info('Inside checkExistingUser Datasource Service')
		try {
			return checkFlag(this.model, { ...query, isDeleted: false })
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}
}
