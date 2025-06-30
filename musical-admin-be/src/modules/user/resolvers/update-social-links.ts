import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'
import { UserDoc } from '@models/user'

interface updateSocialLinkPayload {
	input: any
}

interface Context {
	dataSources: any
	user: UserDoc
}

interface updateSocialLinkResponse {
	message: string
	status: string
}

export const updateSocialLink = {
	Mutation: {
		async updateSocialLink(
			__: any,
			{ input }: updateSocialLinkPayload,
			{ dataSources: { User }, user }: Context
		): Promise<updateSocialLinkResponse> {
			Logger.info('Inside FollowUser Resolvers')
			try {
				if (!user)
					return { message: 'Please check the token. User details does not exist', status: 'error' }

				const { instagram, facebook, twitter, blog,discord } = input

				const data = {
					...(instagram && { 'socialLinks.instagram': instagram }),
					...(facebook && { 'socialLinks.facebook': facebook }),
					...(twitter && { 'socialLinks.twitter': twitter }),
					...(blog && { 'socialLinks.blog': blog }),
					...(discord && {'socialLinks.discord': discord})
				}
				const updatedUser = await User.updateUser(user._id, data)

				if (!updatedUser) return { message: 'Error in updating social links', status: 'error' }

				return updatedUser
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
}
