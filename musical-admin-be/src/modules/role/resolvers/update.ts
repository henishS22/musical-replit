import _ from 'lodash'
import { UserInputError } from 'apollo-server-errors'
import { App, Logger } from '@core/globals'
import { UserDoc } from '@models/user'
import { ReadableToPermissions } from '@core/utils'

interface UpdateRolePayload {
	where: {
		id: typeof App.ObjectId
	}
	input: {
		name?: string
		permissions?: Permissions
	}
}

interface Context {
	user: UserDoc
	dataSources: {
		User: any
		Auth: any
		Role: any
		Activity: any
	}
}

interface UpdateAdminResponse {
	message: string
	status: string
}

export const update = {
	Mutation: {
		async updateRole(
			__: any,
			{ where, input }: UpdateRolePayload,
			{ dataSources, user }: Context
		): Promise<UpdateAdminResponse> {
			Logger.info('Inside updateRole Resolver')
			try {
				const { id } = where
				const { name, permissions } = input
				let permissionsArr
				if (permissions) {
					permissionsArr = await ReadableToPermissions(permissions)
				}

				const data = _.pickBy(
					{
						name,

						permissions: permissionsArr,
						// updatedById: user._id,
					},
					_.identity
				)

				const updatedRole = await dataSources.Role.updateRole(id, data)

				if (!updatedRole) return { message: 'Error updating role', status: 'error' }

				await dataSources.Activity.updateActivity(
					{ userId: user._id },
					{
						activities: [`Updated role ${name}`],
					}
				)

				await dataSources.Activity.updateActivity(
					{ roleId: id },
					{
						activities: [`Updated role by ${user.name}`],
					}
				)
				return { message: 'Role updated Successfully', status: 'success' }
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
}
