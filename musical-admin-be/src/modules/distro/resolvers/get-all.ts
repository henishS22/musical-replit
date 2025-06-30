import { Logger } from '@core/logger'
import { UserInputError } from 'apollo-server-errors'

export const distroList = {
	Query: {
		async distroList(__: any, args: any, { dataSources: { Distro } }, info: any) {
			Logger.info('Inside distroList Resolver')
			try {
				const distroList = await Distro.getDistroList(args, info)

				if (!distroList) throw new Error('No distroList found')

				return { edges: distroList.edges, pageInfo: distroList.pageInfo }
			} catch (err) {
				Logger.error(`${err}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
	Distro: {
		async userId(parent: any, __: any, { dataSources: { User } }, info: any) {
			Logger.info('Inside userId Resolver')
			try {
				return User.getSingleUser({ _id: parent.userId.toString() })
			} catch (err) {
				Logger.error(`${err}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	}
}
