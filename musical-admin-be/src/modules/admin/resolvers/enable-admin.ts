import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'
import { UserDoc } from '@models/user'
import Email from '@helpers/mail'

interface enableAdminPayload {
	input: {
		id: string
	}
}
interface Context {
	user: UserDoc
	dataSources: any
}
interface enableAdminResponse {
	message: string
	status: string
}

export const enableAdmin = {
	Mutation: {
		async enableAdmin(
			__: any,
			{ input }: enableAdminPayload,
			{ dataSources: { Admin, Activity }, user }: Context
		): Promise<enableAdminResponse> {
			Logger.info('Inside enableAdmin Resolvers')
			try {
				if (!user)
					return { message: 'Please check the token. User details does not exist', status: 'error' }

				const { id } = input

				const data = {
					isActive: true,
				}

				const updatedUser = await Admin.updateAdmin(id, data)

				if (!updatedUser) return { message: 'Error in disabling admin', status: 'error' }

				await Activity.updateActivity(
					{ userId: user._id },
					{
						activities: [`Enabled Admin ${updatedUser.fullName}`],
					}
				)

				new Email({ to: updatedUser?.email, name: updatedUser?.fullName }).enableAdmin({
					enabledBy: user?.name,
					enabledByEmail: user?.email,
				})


				return { message: 'Admin is enabled successfully', status: 'success' }
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
}
