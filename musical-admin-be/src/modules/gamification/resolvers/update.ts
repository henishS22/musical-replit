import _ from 'lodash'
import { UserInputError } from 'apollo-server-errors'
import { App, Logger } from '@core/globals'
import { UserDoc } from '@models/user'

interface UpdateEventPayload {
	where: {
		id: typeof App.ObjectId
	}
	input: {
		name: string
		points: number
		occurrence: number
	}
}

interface Context {
	user: UserDoc
	dataSources: any
}

interface UpdateEventResponse {
	message: string
	status: string
}

export const updateEvent = {
	Mutation: {
		async updateEvent(
			__: any,
			{ where, input }: UpdateEventPayload,
			{ dataSources: { Gamification }, user }: Context,
		): Promise<UpdateEventResponse> {
			Logger.info('Inside updateEvent Resolver')
			try {
				const { id } = where
				const { name, points, occurrence } = input

				const data = _.pickBy(
					{
						name, points, occurrence, updatedById: user._id
					},
					_.identity
				)

				const updated = await Gamification.update(id, data)

				if (!updated) return { message: 'Error updating event', status: 'error' }


				return { status: 'success', message: `Event updated Successfully.` }

			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
}