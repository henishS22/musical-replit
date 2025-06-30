import { App, Logger } from '@core/globals'
import { UserInputError } from 'apollo-server-errors'
import { PermissionsToReadable } from '@core/utils'
import { Role } from '@core/constants/roles'
import { RoleDoc } from '@models/role'

export const admins = {
	Query: {
		async admins(__: any, args: any, { dataSources: { Admin } }, info: any) {
			Logger.info('Inside admins Resolver')
			try {
				args.filters = { ...args.filters, accountTypeCodeMatch: Role.ADMIN }

				const users = await Admin.getAdmins(args, info)

				if (!users) throw new Error('No admins found')

				return { edges: users.edges, pageInfo: users.pageInfo }
			} catch (err) {
				Logger.error(`${err}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
	Admin: {
		async role(
			{ roleId }: { roleId: typeof App.ObjectId | RoleDoc },
			__: any,
			{ dataSources: { Role } },
			info: any
		) {
			Logger.info('Inside role Resolver')
			try {
				if (!roleId) return null
				if (typeof roleId === typeof App.ObjectId) return Role.getRoleById(roleId, info)
				if (roleId?.['_id']) return Role.getRoleById(roleId['_id'], info)
				return null
			} catch (err) {
				Logger.error(`${err}`)
				throw new UserInputError(`${err.message}`)
			}
		},
		async createdBy(
			{ createdById }: { createdById: string },
			__: any,
			{ dataSources: { Admin } },
			info: any
		) {
			Logger.info('Inside createdBy Resolver')
			try {
				// return User.getUserById(createdById, info)
				return Admin.getUser(createdById)

			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
		async updatedBy(
			{ updatedById }: { updatedById: string },
			__: any,
			{ dataSources: { Admin } },
			info: any
		) {
			Logger.info('Inside updatedById Resolver')
			try {
				// return User.getUserById(updatedById, info)
				return Admin.getUser(updatedById)

			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
	Role: {
		async id({ _id }: { _id: string }) {
			return _id
		},
		async permissions({ permissions }: { permissions: number[] }) {
			Logger.info('Inside permissions Resolver')
			try {
				return PermissionsToReadable(permissions)
			} catch (err) {
				Logger.error(`${err}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
}
