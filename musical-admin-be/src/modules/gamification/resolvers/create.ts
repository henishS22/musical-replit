import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'
import { AdminDoc } from '@models/admin'

interface CreateAdminPayload {
    input: {
        name: string
        identifier: string
        points: number
        occurrence: number
    }
}

interface Context {
    user: AdminDoc
    dataSources: any
}

interface createEventResponse {
    message: string
    status: string
}

export const create = {
    Mutation: {
        async createEvent(
            __: any,
            { input }: CreateAdminPayload,
            { dataSources: { Gamification }, user }: Context,
        ): Promise<createEventResponse> {
            Logger.info('Inside createEvent Resolvers')
            try {
                if (!user)
                    return { message: 'Please check the token. User details does not exist', status: 'error' }

                const { name, identifier, points, occurrence } = input

                if (!name || !identifier || !points || !occurrence) {
                    return { message: 'Please fill all the fields', status: 'error' }
                }

                const existingIdentifier = await Gamification.checkIdentifier(identifier)

                if (existingIdentifier.length) {
                    return { message: 'Identifier already exists', status: 'error' }
                }

                const payload = {
                    name,
                    identifier,
                    points,
                    occurrence,
                    createdById: user._id,
                    updatedById: user._id
                }

                await Gamification.create(payload)


                return { message: 'Gamification event created Successfully', status: 'success' }
            } catch (err) {
                Logger.error(`${err.message}`)
                throw new UserInputError(`${err.message}`)
            }
        },
    },
}
