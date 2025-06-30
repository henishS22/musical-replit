import _ from 'lodash'
import { UserInputError } from 'apollo-server-errors'
import { App, Logger } from '@core/globals'
import { UserDoc } from '@models/user'

interface UpdateRolePayload {
	where: {
		id: typeof App.ObjectId
	}
	input: {
		status: string
	}
}

interface Context {
	user: UserDoc
	dataSources: any
}

interface UpdateAdminResponse {
	message: string
	status: string
}

export const distroStatus = {
	Mutation: {
		async distroStatus(
			__: any,
			{ where, input }: UpdateRolePayload,
			{ dataSources, user }: Context
		): Promise<UpdateAdminResponse> {
			Logger.info('Inside status Resolver')
			try {
				const { id } = where
				const { status } = input

				const data = _.pickBy(
					{
						status
					},
					_.identity
				)

				const updatedStatus = await dataSources.Distro.updateStatus(id, data)
				if (!updatedStatus) return { message: 'Error updating status', status: 'error' }

				if (updatedStatus.status === 'APPROVED') {
					const user = _.pickBy(
						{
							isDistroApproved: true
						},
						_.identity
					)
					const userId = updatedStatus.userId.toString()
					await dataSources.User.update(userId, user)
				}

				const message = status === 'APPROVED' ? "approved" : "rejected"

				return { status: 'success', message: `Distro ${message} Successfully.` }

			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
}