import _ from 'lodash'
import { UserInputError } from 'apollo-server-errors'
import { App, Logger } from '@core/globals'
import { UserDoc } from '@models/user'

interface UpdateStatusPayload {
    where: {
        id: typeof App.ObjectId
    }
    input: {
        isActive: boolean
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

export const updateStatus = {
    Mutation: {
        async updateStatus(
            __: any,
            { where, input }: UpdateStatusPayload,
            { dataSources: { Gamification }, user }: Context,
        ): Promise<UpdateEventResponse> {
            Logger.info('Inside updateStatus Resolver')
            try {
                const { id } = where
                const { isActive } = input

                const data = {
                    isActive
                }

                const updated = await Gamification.update(id, data)

                if (!updated) return { message: 'Error updating event', status: 'error' }

                const message = isActive ? "activated" : "deactivated"

                return { status: 'success', message: `Event ${message} Successfully.` }

            } catch (err) {
                Logger.error(`${err.message}`)
                throw new UserInputError(`${err.message}`)
            }
        },
    },
}