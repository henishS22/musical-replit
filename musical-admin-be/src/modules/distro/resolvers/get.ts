import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'
import { RoleDoc } from '@models/role'

interface Id {
	id: string
}

interface Context {
	dataSources: any
}

export const distro = {
	Query: {
		async distro(
			__: any,
			{ id }: Id,
			{ dataSources: { Distro } }: Context,
			info: any
		): Promise<any> {
			Logger.info('Inside role Resolver')
			try {
				const distro = await Distro.getDistroById(id, info)
				if (!distro) {
					throw new UserInputError('Role does not exist.')
				}

				return distro
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	}
}