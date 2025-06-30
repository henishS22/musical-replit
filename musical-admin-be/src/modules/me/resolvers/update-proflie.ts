import _ from 'lodash'
import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'
import { UserDoc } from '@models/user'
interface updateProfileInput {
	input: {
		username?: string
		email?: string
		socialLinks?: {
			facebook?: string
			twitter?: string
			instagram?: string
			website?: string
			blog?: string
		}
		profilePic?: string
		coverPic?: string
		description?: string
		tags?: [string]
		notificationSetting: {
			itemSold: boolean
			bidActivity: boolean
			priceChange: boolean
			outbid: boolean
			itemBought: boolean
			newsletter: boolean
		}
		isPublic:string
	}
}
interface Context {
	dataSources: any
	user: UserDoc
}
interface updateProfileResponse {
	message: string
	status: string
}

export const updateProfile = {
	Mutation: {
		updateProfile: async (
			__: any,
			{ input }: updateProfileInput,
			{ dataSources: { User }, user }: Context
		): Promise<updateProfileResponse> => {
			Logger.info('Inside updateProfile resolver')
			try {
				if (!user)
					return { message: 'Please check the token. User details does not exist', status: 'error' }

				const {
					username,
					email,
					socialLinks,
					profilePic,
					coverPic,
					description,
					tags,
					notificationSetting,
					isPublic,
				} = input
				let socialCredsData, notificationSettingData

				if (notificationSetting) {
					const { itemSold, bidActivity, priceChange, outbid, itemBought, newsletter } =
						notificationSetting
					notificationSettingData = _.pickBy(
						{ itemSold, bidActivity, priceChange, outbid, itemBought, newsletter },
						_.identity
					)
				}
				if (socialLinks) {
					const { facebook, twitter, instagram, website, blog } = socialLinks
					socialCredsData = _.pickBy(
						{
							facebook,
							twitter,
							instagram,
							website,
							blog,
						},
						_.identity
					)
				}
				const payload = _.pickBy(
					{
						username,
						email,
						socialLinks: socialCredsData,
						profilePic,
						coverPic,
						description,
						tags,
						notificationSetting: notificationSettingData,
						isPublic
					},
					_.identity
				)
				const updateProfile = await User.updateUser(user._id, payload)

				if (!updateProfile) return { message: 'Error updating Profile', status: 'error' }

				return {
					message: 'User Profile updated Successfully',
					status: 'success',
				}
			} catch (error) {
				Logger.error(`${error.message}`)
				throw new UserInputError(`${error.message}`)
			}
		},
	},
}
