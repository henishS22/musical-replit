import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'
import { RoleDoc } from '@models/role'

interface Id {
	id: string
}

interface Context {
	dataSources: any
}

export const metadata = {
	Query: {
		async release(
			__: any,
			{ id }: Id,
			{ dataSources: { Metadata } }: Context,
			info: any
		): Promise<any> {
			Logger.info('Inside metadata Resolver')
			try {
				const metadata = await Metadata.getMetadataById(id, info)
				if (!metadata) {
					throw new UserInputError('Role does not exist.')
				}

				return metadata
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	}
}