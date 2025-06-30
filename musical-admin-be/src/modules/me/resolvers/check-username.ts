import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'

interface CheckUserNamePayload {
	input: {
		username: string
	}
}
interface Context {
	dataSources: any
}
interface CheckUserNameResponse {
	message: string
	status: string
}

export const checkUserNameExist = {
	Mutation: {
		async checkUserNameExist(
			__: any,
			{ input }: CheckUserNamePayload,
			{ dataSources: { Auth } }: Context
		): Promise<CheckUserNameResponse> {
			Logger.info('Inside checkUserNameExist Resolvers')
			try {
				const { username } = input

				const user = await Auth.getUserForAuth({ username })

				if (user) {
					return { message: 'User name already exists', status: 'error' }
				}

				return { message: 'User name is available', status: 'success' }
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
}
