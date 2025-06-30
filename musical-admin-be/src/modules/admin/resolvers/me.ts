import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'
import { UserDoc } from '@models/user'

interface Context {
	user: UserDoc
}

export const getProfile = {
	Query: {
		async me(__: any, ___: any, { user }: Context): Promise<UserDoc> {
			Logger.info('Inside me Resolvers')
			try {
				return user
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
}
