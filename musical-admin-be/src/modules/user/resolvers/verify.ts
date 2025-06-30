import _ from 'lodash'
import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'
import { UserDoc } from '@models/user'

interface VerifyUserPayload {
	input: {
		id?: string
	}
}

interface Context {
	user: UserDoc
	dataSources: any
}

interface VerifyUserResponse {
	message: string
	status: string
}

export const verifyUser = {
	Mutation: {
		async verifyUser(
			__: any,
			{ input }: VerifyUserPayload,
			{ dataSources: { User, Activity }, user }: Context
		): Promise<VerifyUserResponse> {
			Logger.info('Inside verifyUser Resolvers')
			try {
				if (!user)
					return { message: 'Please check the token. User details does not exist', status: 'error' }

				const { id } = input

				const data = _.pickBy(
					{
						isVerified: true,
					},
					_.identity
				)

				const verifyUser = await User.updateUser(id, data)

				if (!verifyUser) return { message: 'Error in verifying user', status: 'error' }

				await Activity.updateActivity(
					{ userId: user._id },
					{
						activities: [`verified user ${verifyUser.fullName}`],
					}
				)
				return { message: 'User verified Successfully', status: 'success' }
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
}
