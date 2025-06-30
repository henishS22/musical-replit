import { Role } from '@core/constants/roles'
import { App, Logger } from '@core/globals'
import { UserDoc } from '@models/user'
import { UserInputError } from 'apollo-server-errors'
import { Project } from '@models/project'
import { ObjectId } from 'bson'

interface getUserPayload {
	id: string
}

interface Context {
	dataSources: any
	user: UserDoc
}

export const user = {
	Query: {
		async user(
			__: any,
			{ id }: getUserPayload,
			{ dataSources: { User, Item, Whitelist, WhitelistRequest }, user }: Context,

			info: any
		) {
			Logger.info('Inside getUser Resolvers')
			const trackQuery: any = [
				{
					$match: {
						"_id": new ObjectId(id)
					}
				},
				{
					$lookup: {
						from: "tracks",
						localField: "_id",
						foreignField: "user_id",
						as: "trackDetails"
					}
				},
				{
					$lookup: {
						from: "projects",
						localField: "_id",
						foreignField: "user",
						as: "projectDetails"
					}
				},
				{
					$project: {
						projectList: "$projectDetails",
						totalMusicTracks: { $size: "$trackDetails" },
						totalProject: { $size: "$projectDetails" },
					}
				}
			]
			try {
				const userdata = await User.getSingleUser({ _id: id, roles: { $in: Role.USER } }, info);
				const ProjectAndTracksData = await User.getProjectAndTrackcount(trackQuery);

				if (!userdata) {
					throw new UserInputError('User does not exist.')
				}

				return {
					user: userdata,
					projectList: ProjectAndTracksData[0].projectList,
					totalProject: ProjectAndTracksData[0].totalProject,
					totalMusicTracks: ProjectAndTracksData[0].totalMusicTracks,
				}
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
	User: {
		id({ _id }: { _id: string }) {
			return _id
		},
	},
}
