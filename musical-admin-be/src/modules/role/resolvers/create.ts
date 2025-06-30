import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'
import { Permissions } from '@models/role'
import { UserDoc } from '@models/user'
import { ReadableToPermissions } from '@core/utils'

interface CreateRolePayload {
	input: {
		name: string
		permissions: Permissions
	}
}

interface Context {
	user: UserDoc
	dataSources: any
}

interface createRoleResponse {
	message: string
	status: string
}

export const create = {
	Mutation: {
		async createRole(
			__: any,
			{ input }: CreateRolePayload,
			{ dataSources, user }: Context
		): Promise<createRoleResponse> {
			Logger.info('Inside createRole Resolvers')
			try {
				const { name, permissions } = input

				const existingRole = await dataSources.Role.checkExistingRole({ name, isActive: true })
				if (existingRole) {
					return {
						message: 'Role already exists',
						status: 'error',
					}
				}

				const readablePermissions = await ReadableToPermissions(permissions)

				if (!readablePermissions) {
					return {
						message: 'Error creating role',
						status: 'error',
					}
				}

				const newRole = await dataSources.Role.create({
					name,
					permissions: readablePermissions,
					createdById: user._id,
				})

				if (!newRole)
					return {
						message: 'Error creating role',
						status: 'error',
					}
				await dataSources.Activity.create({
					roleId: newRole._id,
					activities: [],
				})
				await dataSources.Activity.updateActivity(
					{ userId: user._id },
					{
						activities: [`Created new role ${name}`],
					}
				)

				return { message: 'Role created Successfully', status: 'success' }
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
}
