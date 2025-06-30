import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'
import { UserDoc } from '@models/user'

interface graphPayload {
	input: {
		interval: string
	}
}
interface Context {
	user: UserDoc
	dataSources: any
}

interface graphResponse {
	message: string
	status: string
	graphdata?: any
}

export const graph = {
	Mutation: {
		async graph(
			_: any,
			{ input }: graphPayload,
			{ dataSources: { Transaction }, user }: Context
		): Promise<graphResponse> {
			Logger.info('Inside graph Resolvers')
			try {
				if (!user)
					return { message: 'Please check the token. User details does not exist', status: 'error' }

				const graphdata = await Transaction.getTransactionGraphOnDashboard(input)

				return {
					graphdata,
					message: 'graph data fetched successfully',
					status: 'success',
				}
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
}
