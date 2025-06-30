import { Logger } from '@core/logger'
import { UserInputError } from 'apollo-server-errors'

export const gamificationList = {
	Query: {
		async gamificationList(__: any, args: any, { dataSources: { Gamification } }, info: any) {
			Logger.info('Inside gamificationList Resolver')
			try {
				const gamificationList = await Gamification.getGamificationList(args, info)

				if (!gamificationList) throw new Error('No gamificationList found')

				return { edges: gamificationList.edges, pageInfo: gamificationList.pageInfo }
			} catch (err) {
				Logger.error(`${err}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
	Gamification: {
		async createdById(parent: any, __: any, { dataSources: { Admin } }, info: any) {
			Logger.info('Inside createdById Resolver')
			try {
				return Admin.getUser(parent.createdById.toString())
			} catch (err) {
				Logger.error(`${err}`)
				throw new UserInputError(`${err.message}`)
			}
		},
		async updatedById(parent: any, __: any, { dataSources: { Admin } }, info: any) {
			Logger.info('Inside updatedById Resolver')
			try {
				return Admin.getUser(parent.updatedById.toString())
			} catch (err) {
				Logger.error(`${err}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	}
}
