import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'
import { UserDoc } from '@models/user'

interface UnfollowUserPayload {
	input: {
		id?: string
	}
}

interface Context {
	dataSources: any
	user: UserDoc
}

interface UnfollowUserResponse {
	message: string
	status: string
}

export const unfollowUser = {
	Mutation: {
		async unfollowUser(
			__: any,
			{ input }: UnfollowUserPayload,
			{ dataSources: { Follower }, user }: Context
		): Promise<UnfollowUserResponse> {
			Logger.info('Inside unfollowUser Resolvers')
			try {
				if (!user)
					return { message: 'Please check the token. User details does not exist', status: 'error' }

				const { id } = input

				const data = {
					userId: user._id,
					followingId: id,
				}

				const followedUser = await Follower.unfollowUser(data.userId, id)

				if (!followedUser) return { message: 'Error in following user', status: 'error' }

				return { message: 'User Unfollowed Successfully', status: 'success' }
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
}
