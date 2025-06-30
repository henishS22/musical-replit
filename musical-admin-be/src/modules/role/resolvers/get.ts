import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'
import { RoleDoc } from '@models/role'

interface getRoleById {
	id: string
}

interface Context {
	dataSources: any
}

interface Respone {
	role: Promise<RoleDoc> | null
}

export const role = {
	Query: {
		async role(
			__: any,
			{ id }: getRoleById,
			{ dataSources: { Role } }: Context,
			info: any
		): Promise<Respone> {
			Logger.info('Inside role Resolver')
			try {
				const role = await Role.getRoleById(id, info)

				if (!role) {
					throw new UserInputError('Role does not exist.')
				}

				return role
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
}
