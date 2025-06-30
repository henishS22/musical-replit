import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'

interface GlobalSearchInput {
	input: {
		keyword: string
	}
}

interface GlobalSearchResponse {
	message: string
	status: string
	ProjectResult?: any
}

export const searchProjects = {
	Query: {
		searchProject: async (
			__: any,
			{ input }: GlobalSearchInput,
			{ dataSources: { Project, Category, Item, Collection } }
		): Promise<GlobalSearchResponse> => {
			Logger.info('Inside search resolver')
			
			try {
				const { keyword } = input

				let resultObject = []
				const searchUserResult = await Project.searchProject(keyword)
				if (searchUserResult?.length) {
					resultObject = resultObject.concat(searchUserResult)
				}

				// const searchCategoryResult = await Category.search(keyword)
				// if (searchCategoryResult?.length) {
				// 	resultObject = resultObject.concat(searchCategoryResult)
				// }

				// const searchItemResult = await Item.search(keyword)
				// if (searchItemResult?.length) {
				// 	resultObject = resultObject.concat(searchItemResult)
				// }

				// const searchCollectionResult = await Collection.search(keyword)
				// if (searchCollectionResult?.length) {
				// 	resultObject = resultObject.concat(searchCollectionResult)
				// }

				if (resultObject.length === 0) {
					return { message: 'Error in searching', status: 'error' }
				}
				return {
					message: 'Search is done successfully',
					status: 'success',
					ProjectResult: resultObject,
				}
			} catch (error) {
				Logger.error(`${error.message}`)
				throw new UserInputError(`${error.message}`)
			}
		},
	},
}
