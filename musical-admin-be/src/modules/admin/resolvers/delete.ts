import { UserInputError } from 'apollo-server-errors'
import { App, Logger } from '@core/globals'
import { UserDoc } from '@models/user'
import Email from '@helpers/mail'

interface DeleteAdminPayload {
	where: {
		id: typeof App.ObjectId
	}
}

interface Context {
	user: UserDoc
	dataSources: any
}

interface DeleteAdminResponse {
	message: string
	status: string
}

export const remove = {
	Mutation: {
		async deleteAdmin(
			__: any,
			{ where }: DeleteAdminPayload,
			{ dataSources: { Admin, Activity }, user }: Context
		): Promise<DeleteAdminResponse> {
			Logger.info('Inside deleteAdmin Resolvers')
			try {
				if (!user)
					return { message: 'Please check the token. User details does not exist', status: 'error' }

				const { id } = where

				const data = {
					isDeleted: true,
					isActive: false,
					updatedById: user._id,
				}

				const updatedUser = await Admin.updateUser(id, data)

				if (!updatedUser) return { message: 'Error deleting admin', status: 'error' }

				await Activity.updateActivity(
					{ userId: user._id },
					{
						activities: [`Deleted user ${updatedUser.fullName}`],
					}
				)
				new Email({ to: updatedUser?.email, name: updatedUser?.name }).deleteAdmin({
					deletedBy: user?.name,
				})

				return { message: 'Admin deleted Successfully', status: 'success' }
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
}
