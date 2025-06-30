import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'
import { ActivityDoc } from '@models/activity'
import { UserDoc } from '@models/user'

interface getActivityPayload {
	input: {
		id: string
		type: string
	}
}

interface Context {
	dataSources: any
	user: UserDoc
}

export const get = {
	Query: {
		async activity(
			__: any,
			{ input }: getActivityPayload,
			{ dataSources: { Activity } }: Context,
			info: any
		): Promise<ActivityDoc> {
			Logger.info('Inside activity Resolvers')
			try {
				const { id, type } = input

				const activity = await Activity.getActivityById(id, type, info)
				if (!activity) {
					throw new UserInputError('Activity not found')
				}
				return activity
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
	Activity: {
		id({ _id }: { _id: string }) {
			return _id
		},
		async user(parent: any, __: any, { dataSources: { User } }, info: any) {
			Logger.info('Inside user Resolver')
			try {
				return User.getUserById(parent.userId, info)
			} catch (err) {
				Logger.error(`${err}`)
				throw new UserInputError(`${err.message}`)
			}
		},
		async role(parent: any, __: any, { dataSources: { Role } }, info: any) {
			Logger.info('Inside role Resolver')
			try {
				return Role.getRoleById(parent.roleId, info)
			} catch (err) {
				Logger.error(`${err}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
}
