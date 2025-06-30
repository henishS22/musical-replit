import _ from 'lodash'
import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'
import { UserDoc } from '@models/user'
import { Role } from '@core/constants/roles'
import { PermissionsToReadable } from '@core/utils'

interface getAdminPayload {
	id: string
}

interface Context {
	dataSources: any
}

interface PermissionParentObj {
	roleId: string
	permissions: number[]
}

export const admin = {
	Query: {
		async admin(
			__: any,
			{ id }: getAdminPayload,
			{ dataSources: { Admin } }: Context,
			info: any
		): Promise<UserDoc> {
			Logger.info('Inside getAdmin Resolvers')
			try {
				//	const admin = await Admin.getUser({ _id: id, accountTypeCode: Role.ADMIN }, info)
				const admin = await Admin.getUser(id);
				if (!admin) {
					throw new UserInputError('Admin does not exist.')
				}

				return admin
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
	Admin: {
		id({ _id }: { _id: string }) {
			return _id
		},
		async permissions(
			{ permissions, roleId }: PermissionParentObj,
			__: any,
			{ dataSources }: Context
		) {
			Logger.info('Inside permissions Resolver.')
			try {
				const role = await dataSources.Role.getRole(roleId, 'permissions _id')
				if (!role) return null

				// Creating set of permissions array (user permissions + roles permissions)
				const permissionsArr = _.union(role.permissions, permissions)

				// Converting permissions array into redable object
				return PermissionsToReadable(permissionsArr)
			} catch (err) {
				Logger.error(`${err.message}`)
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
}