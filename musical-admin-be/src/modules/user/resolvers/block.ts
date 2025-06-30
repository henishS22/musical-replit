import _ from 'lodash'
import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'
import { UserDoc } from '@models/user'

interface BlockUserPayload {
	input: {
		id?: string
	}
}

interface Context {
	user: UserDoc
	dataSources: any
}

interface BlockUserResponse {
	message: string
	status: string
}

export const blockUser = {
	Mutation: {
		async blockUser(
			__: any,
			{ input }: BlockUserPayload,
			{ dataSources: { User, Activity }, user }: Context
		): Promise<BlockUserResponse> {
			Logger.info('Inside blockUser Resolvers')
			try {
				if (!user)
					return { message: 'Please check the token. User details does not exist', status: 'error' }

				const { id } = input

				const data = _.pickBy(
					{
						isBlocked: true,
					},
					_.identity
				)

				const blockUser = await User.updateUser(id, data)
				if (!blockUser) return { message: 'Error in blocking user', status: 'error' }

				await Activity.updateActivity(
					{ userId: user._id },
					{
						activities: [`blocked user ${blockUser.fullName}`],
					}
				)


				return { message: 'User blocked Successfully', status: 'success' }
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
}
