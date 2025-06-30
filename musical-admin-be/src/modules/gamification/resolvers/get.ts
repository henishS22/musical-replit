import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'
import { RoleDoc } from '@models/role'

interface Id {
	id: string
}

interface Context {
	dataSources: any
}

export const gamification = {
	Query: {
		async gamification(
			__: any,
			{ id }: Id,
			{ dataSources: { Gamification } }: Context,
			info: any
		): Promise<any> {
			Logger.info('Inside gamification Resolver')
			try {
				const gamification = await Gamification.getGamificationById(id, info)
				if (!gamification) {
					throw new UserInputError('Event does not exist.')
				}
				return gamification
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	}
}