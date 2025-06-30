import { UserInputError } from 'apollo-server-errors'
import { App, Logger } from '@core/globals'
import { UserDoc } from '@models/user'
import Email from '@helpers/mail'
interface BanUserPayload {
	input: {
		id: string
		isBanned: boolean
	}
}

interface Context {
	user: UserDoc
	dataSources: any
}

interface BlockUserResponse {
	message: string
	status: string
}

export const banUser = {
	Mutation: {
		async banUser(
			__: any,
			{ input }: BanUserPayload,
			{ dataSources: { User, Activity }, user }: Context
		): Promise<BlockUserResponse> {
			Logger.info('Inside banUser Resolvers')
			try {
				if (!user)
					return { message: 'Please check the token. User details does not exist', status: 'error' }

				const { id, isBanned } = input


				const blockUser = await User.updateUser(id, { isBanned })
				if (!blockUser) return { message: 'Error in banning user', status: 'error' }
				await Activity.updateActivity(
					{ userId: user._id },
					{
						activities: [`banned user ${blockUser.fullName}`],
					}
				)
				if (isBanned) {
					new Email({ to: blockUser?.email, name: blockUser?.name }).banUser({
						bannedBy: 'Admin',
						to: blockUser?.name,
						platfromEmail: App.Config.MAIL_JET.FROM,
					})
				}

				if (!isBanned) {
					new Email({ to: blockUser?.email, name: blockUser?.name }).UnBanUser({
						to: blockUser?.name,
						platfromEmail: App.Config.MAIL_JET.FROM,
					})
				}

				return { message: isBanned ? 'User banned Successfully' : 'User unbanned Successfully', status: 'success' }
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
}
