import { Logger } from '@core/logger'
import { UserInputError } from 'apollo-server-errors'
import { PermissionsToReadable } from '@core/utils'

export const roles = {
	Query: {
		async roles(__: any, args: any, { dataSources: { Role } }, info: any) {
			Logger.info('Inside role Resolver')
			try {
				const roles = await Role.getRoles(args, info)

				if (!roles) throw new Error('No roles found')

				return { edges: roles.edges, pageInfo: roles.pageInfo }
			} catch (err) {
				Logger.error(`${err}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
	Role: {
		id({ _id }: { _id: string }) {
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
		async createdBy(parent: any, __: any, { dataSources: { Admin } }, info: any) {
			Logger.info('Inside createdBy Resolver')
			try {
				return Admin.getUser(parent.createdById)
			} catch (err) {
				Logger.error(`${err}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
}
