import { Logger } from '@core/logger'
import { UserInputError } from 'apollo-server-errors'

export const account = {
	Query: {
		async account(__: any, args: any, { dataSources: { Account } }, info: any) {
			Logger.info('Inside users Resolver')
			try {
				args.filters = { ...args.filters}
				const users = await Account.getUsers(args, info)
				if (!users) throw new Error('No users found')

				// return users
				return { edges: users.edges, pageInfo: users.pageInfo }
			} catch (err) {
				Logger.error(`${err}`)
				throw new UserInputError(`${err.message}`)
			}
		}
	},
}
