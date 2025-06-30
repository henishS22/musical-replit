import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'
import { UserDoc } from '@models/user'

interface FollowUserPayload {
	input: {
		id?: string
	}
}

interface Context {
	dataSources: any
	user: UserDoc
}

interface FollowUserResponse {
	message: string
	status: string
}

export const followUser = {
	Mutation: {
		async followUser(
			__: any,
			{ input }: FollowUserPayload,
			{ dataSources: { Follower }, user }: Context
		): Promise<FollowUserResponse> {
			Logger.info('Inside FollowUser Resolvers')
			try {
				if (!user)
					return { message: 'Please check the token. User details does not exist', status: 'error' }

				const { id } = input

				const data = {
					userId: user._id,
					followingId: id,
					createdById: user._id,
				}

				const followedUser = await Follower.followUser(data.userId, id)

				if (!followedUser) return { message: 'Error in following user', status: 'error' }

				return { message: 'User followed Successfully', status: 'success' }
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
}
