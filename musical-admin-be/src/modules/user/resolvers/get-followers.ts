import { Logger } from '@core/logger'
import { UserInputError } from 'apollo-server-errors'

export const userFollowers = {
	Query: {
		async followers(__: any, args: any, { dataSources: { Follower } }) {
			Logger.info('Inside followers Resolver')
			try {
				const followerDoc = await Follower.getFollowDoc(args.userId)
				if (!followerDoc) throw new Error('No followers found')
				return {
					...followerDoc,
					totalFollower: followerDoc.followerIds.length,
					totalFollowing: followerDoc.followingIds.length,
				}
			} catch (err) {
				Logger.error(`${err}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
	FollowerDoc: {
		async followingIds(parent: any, args: any, { dataSources: { User } }, info: any) {
			Logger.info('Inside followingIds Resolver')
			try {
				args.filters = { ...args.filters, _id: { $in: parent.followingIds.map(String) } }

				const users = await User.getUsers(args, info)

				if (!users) throw new Error('No users found')

				return { edges: users.edges, pageInfo: users.pageInfo }
			} catch (err) {
				Logger.error(`${err}`)
				throw new UserInputError(`${err.message}`)
			}
		},
		async followerIds(parent: any, args: any, { dataSources: { User } }, info: any) {
			Logger.info('Inside followerIds Resolver')
			try {
				args.filters = { ...args.filters, _id: { $in: parent.followerIds.map(String) } }

				const users = await User.getUsers(args, info)

				if (!users) throw new Error('No users found')

				return { edges: users.edges, pageInfo: users.pageInfo }
			} catch (err) {
				Logger.error(`${err}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
}
