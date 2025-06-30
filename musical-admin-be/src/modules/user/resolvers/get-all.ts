import { Logger } from '@core/logger'
import { UserInputError } from 'apollo-server-errors'
import { Role } from '@core/constants/roles'

export const users = {
	Query: {
		async users(__: any, args: any, { dataSources: { User } }, info: any) {
			Logger.info('Inside users Resolver')

			try {
				args.filters = { ...args.filters, rolesMatch: Role.USER }

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