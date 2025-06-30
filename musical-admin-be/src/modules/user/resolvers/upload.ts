import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'

interface GlobalSearchInput {
	input: {
		name: string
		extension: string
	}
}

interface GlobalSearchResponse {
	message: string
	status: string
	imageUrl?: any
}

export const uploadImage = {
	Query: {
		uploadImage: async (
			__: any,
			{ input }: GlobalSearchInput,
			{ dataSources: { User } }
		): Promise<GlobalSearchResponse> => {
			Logger.info('Inside uploadImage resolver')
			try {
				const { name, extension } = input

				const imageUrl = await User.upload(name, extension)
				if (!imageUrl) {
					return { message: 'Image format not supported', status: 'error' }
				}
				return {
					message: 'Search is done successfully',
					status: 'success',
					imageUrl,
				}
			} catch (error) {
				Logger.error(`${error.message}`)
				throw new UserInputError(`${error.message}`)
			}
		},
	},
}
