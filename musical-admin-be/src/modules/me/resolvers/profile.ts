import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'
import { UserDoc } from '@models/user'
import { Role } from '@core/constants/roles'

interface profilePayload {
	id: string
}

interface Context {
	dataSources: any
	user: UserDoc
}

export const profile = {
	Query: {
		async profile(
			__: any,
			{ id }: profilePayload,
			{ dataSources: { User, Collection, Item }, user }: Context,
			info: any
		): Promise<UserDoc> {
			Logger.info('Inside profile Resolvers')
			try {
				if (!user) {
					throw new UserInputError('Please check the token. User details does not exist')
				}

				let userDetails
				if (user && user._id.toString() === id) {
					userDetails = user
				}

				userDetails = await User.getUser({ _id: id, accountTypeCode: Role.USER }, info)

				if (!userDetails) {
					throw new UserInputError('User does not exist.')
				}

				// const collections = await Collection.countCollections({ createdById: user._id })
				// const NftsOwned = await Item.countItems({ currentOwner: user._id })

				return {
					...userDetails,
					// totalCollections: collections,
					// totalNfts: NftsOwned,
				}
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
}
