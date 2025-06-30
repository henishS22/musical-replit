import { App, Logger } from '@core/globals'
import { UserInputError } from 'apollo-server-errors'
import { PermissionsToReadable } from '@core/utils'
import { Role } from '@core/constants/roles'
import { RoleDoc } from '@models/role'
import { UserDoc } from '@models/user'


interface Context {
	user: UserDoc
	dataSources: any
}

export const getRequests = {
	Query: {
		async getRequests(__: any, args: any, { dataSources: { Admin },user }, info: any) {
			Logger.info('Inside admins Resolver')
			try {
				// check for admin
				if (![Role.ADMIN, Role.SUPER_ADMIN].includes(user.accountTypeCode)) {
					throw new UserInputError(
						'Unauthorized access: Only ADMIN or SUPER_ADMIN can access this data'
					)
				}
				args.filters = {
					...args.filters,
					isCollectionAccess: false,
					reason: { $exists: true, $ne: null },
				}
				const users = await Admin.getUserAccessRequests(args, info)
				if (!users) throw new Error('No user requests found')

				return { edges: users.edges, pageInfo: users.pageInfo }
			} catch (err) {
				Logger.error(`${err}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
}
