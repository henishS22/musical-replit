import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'
import { UserDoc } from '@models/user'


interface Context {
	user: UserDoc
	dataSources: any
}

interface SellNftGraphResponse {
	message: string
	status: string
	sellNftGraphdata?: any
}

interface sellNftGraphPayload {
	input: {
		interval: string
	}
}

export const sellNftGraph = {
	Mutation: {
		async sellNftGraph(
			_: any,
			{ input }: sellNftGraphPayload,
			{ dataSources: { SellItem }, user }: Context
		): Promise<SellNftGraphResponse> {
			Logger.info('Inside sell nft graph Resolvers')
			try {
				if (!user)
				return { message: 'Please check the token. User details does not exist', status: 'error' }
				
				// const sellNftGraphdata = await SellItem.getSellNftGraphOnDashboard(input)

				return {
					// sellNftGraphdata,
					message: 'Sell nft graph data fetched successfully',
					status: 'success',
				}
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
}
