import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'
import { UserDoc } from '@models/user'


interface Context {
	user: UserDoc
	dataSources: any
}

interface userGraphResponse {
	message: string
	status: string
	userGraphdata?: any
}

interface userGraphPayload {
	input: {
		interval: string
	}
}

export const userGraph = {
	Mutation: {
		async userGraph(
			_: any,
			{ input }: userGraphPayload,
			{ dataSources: { User }, user }: Context
		): Promise<userGraphResponse> {
			Logger.info('Inside user graph Resolvers')
			try {
				if (!user)
				return { message: 'Please check the token. User details does not exist', status: 'error' }
				
				const userGraphdata = await User.getUserGraphOnDashboard(input)

				return {
					userGraphdata,
					message: 'User graph data fetched successfully',
					status: 'success',
				}
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
}
