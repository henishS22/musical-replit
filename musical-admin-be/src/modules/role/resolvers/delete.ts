import { UserInputError } from 'apollo-server-errors'
import { App, Logger } from '@core/globals'
import { UserDoc } from '@models/user'

interface DeleteRolePayload {
	where: {
		id: typeof App.ObjectId
	}
}

interface Context {
	user: UserDoc
	dataSources: {
		Role: any
		Activity: any
		Admin: any
	}
}

interface DeleteAdminResponse {
	message: string
	status: string
}

export const remove = {
	Mutation: {
		async deleteRole(
			__: any,
			{ where }: DeleteRolePayload,
			{ dataSources, user }: Context
		): Promise<DeleteAdminResponse> {
			Logger.info('Inside deleteRole Resolver')
			try {
				const { id } = where

				const checkExistingRole = await dataSources.Admin.checkExistingUser({ roleId: id })

				if (checkExistingRole) {
					return {
						message: 'Error deleting role due to existing users with the same role',
						status: 'error',
					}
				}

				const updatedRole = await dataSources.Role.updateRole(id, {
					isActive: false,
					updatedById: user._id,
				})

				if (!updatedRole) return { message: 'Error deleting role', status: 'error' }

				await dataSources.Activity.updateActivity(
					{ userId: user._id },
					{
						activities: [`Deleted role ${updatedRole.name}`],
					}
				)

				await dataSources.Activity.updateActivity(
					{ roleId: id },
					{
						activities: [`Deleted role by ${user.name}`],
					}
				)

				return { message: 'Role deleted Successfully', status: 'success' }
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
}
