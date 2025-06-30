import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'

interface CheckEmailPayload {
	input: {
		email: string
	}
}

interface Context {
	dataSources: any
}
interface CheckEmailResponse {
	message: string
	status: string
}

export const checkUserEmailExist = {
	Mutation: {
		async checkUserEmailExist(
			__: any,
			{ input }: CheckEmailPayload,
			{ dataSources: { Auth } }: Context
		): Promise<CheckEmailResponse> {
			Logger.info('Inside checkUserEmailExist Resolvers')
			try {
				const { email } = input

				const emailExist = await Auth.getUserForAuth({ email })

				if (emailExist) {
					return { message: 'Email already exists', status: 'error' }
				}

				return { message: 'Email address is available', status: 'success' }
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
}
