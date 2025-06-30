import _ from 'lodash'
import { UserInputError } from 'apollo-server-errors'
import { App, Logger } from '@core/globals'
import { UserDoc } from '@models/user'
import { Permissions } from '@models/role'
import { ReadableToPermissions } from '@core/utils'
import Email from '@helpers/mail'

interface UpdateAdminPayload {
	input: {
		email?: string
		mobile?: string
		countryCode?: string
		roleId?: typeof App.ObjectId
		fullName?: string
		permissions?: Permissions
	}
	where: {
		id: typeof App.ObjectId
	}
}

interface Context {
	user: UserDoc
	dataSources: {
		User: any
		Auth: any
		Role: any
		Admin: any
	}
}

interface UpdateAdminResponse {
	message: string
	status: string
}

export const update = {
	Mutation: {
		async updateAdmin(
			__: any,
			{ input, where }: UpdateAdminPayload,
			{ dataSources, user }: Context
		): Promise<UpdateAdminResponse> {
			Logger.info('Inside updateAdmin Resolvers')
			try {
				if (!user)
					return { message: 'Please check the token. User details does not exist', status: 'error' }
				const { email, countryCode, roleId, fullName, permissions } = input
				const { id } = where

				const admin = await dataSources.Admin.getUser(id)
				if (!admin) return { message: 'User not found', status: 'error' }
				if (email) {
					if (admin.email !== email) {
						const existingEmail = await dataSources.Auth.checkExistingUser({ email })

						if (existingEmail) return { message: 'Email already taken', status: 'error' }
					}
				}

				let permissionsArr: number[], extraPermissions: number[], rolePermissionsArr: number[]

				if (roleId) {
					const rolePermissions = await dataSources.Role.getRole(roleId, '_id permissions')

					if (!rolePermissions) return { message: 'Invalid role', status: 'error' }

					rolePermissionsArr = rolePermissions.permissions
				}

				if (permissions) {
					permissionsArr = await ReadableToPermissions(permissions)
					extraPermissions = _.without(permissionsArr, ...rolePermissionsArr)
				}

				const data = _.pickBy(
					{
						email,
						countryCode,
						roleId,
						fullName,
						permissions: extraPermissions,
						updatedById: user._id,
					},
					_.identity
				)

				const updatedUser = await dataSources.Admin.updateUser(id, data)

				if (!updatedUser) return { message: 'Error updating user', status: 'error' }

				if (user._id !== updatedUser._id) {
					admin?.email !== updatedUser?.email &&
						new Email({ name: updatedUser?.fullName, to: updatedUser?.email }).emailChanged({
							changedBy: user?.name,
							changedByEmail: user?.email,
						})
				}

				return { message: 'Admin updated Successfully', status: 'success' }
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
}
