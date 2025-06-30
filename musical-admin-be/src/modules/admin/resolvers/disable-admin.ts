import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'
import { UserDoc } from '@models/user'
import Email from '@helpers/mail'

interface disableAdminPayload {
	input: {
		id: string
	}
}
interface Context {
	user: UserDoc
	dataSources: any
}
interface disableAdminResponse {
	message: string
	status: string
}

export const disableAdmin = {
	Mutation: {
		async disableAdmin(
			__: any,
			{ input }: disableAdminPayload,
			{ dataSources: { Admin, Activity }, user }: Context
		): Promise<disableAdminResponse> {
			Logger.info('Inside disableAdmin Resolvers')
			try {
				if (!user)
					return { message: 'Please check the token. User details does not exist', status: 'error' }

				const { id } = input

				const data = {
					isActive: false,
				}

				const updatedUser = await Admin.updateAdmin(id, data)

				if (!updatedUser) return { message: 'Error in disabling admin', status: 'error' }

				await Activity.updateActivity(
					{ userId: user._id },
					{
						activities: [`Disabled Admin ${updatedUser.fullName}`],
					}
				)

				new Email({ to: updatedUser?.email, name: updatedUser?.fullname }).disableAdmin({
					disabledBy: user?.name,
					disabledByEmail: user?.email,
				})


				return { message: 'Admin is disabled successfully', status: 'success' }
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
}
