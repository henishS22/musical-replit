import { App } from '@core/globals'
import { Logger } from '@core/logger'
import { UserInputError } from 'apollo-server-errors'

export const releaseList = {
	Query: {
		async releaseList(__: any, args: any, { dataSources: { Metadata } }, info: any) {
			Logger.info('Inside releaseList Resolver')
			try {
				const releaseList = await Metadata.getMetadataList(args, info)

				if (!releaseList) throw new Error('No releaseList found')

				return { edges: releaseList.edges, pageInfo: releaseList.pageInfo }
			} catch (err) {
				Logger.error(`${err}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
	Release: {
		async trackId(parent: any, __: any, { dataSources: { User } }, info: any) {
			Logger.info('Inside trackId Resolver')
			try {
				const track = await App.Models.Track.findOne({ _id: parent?.track?.trackId?.toString() })
				return track
			} catch (err) {
				Logger.error(`${err}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	}
}
