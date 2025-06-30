import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'
import { SubscriptionDoc } from '@models/subscription'

interface getSubscriptionPayload {
  id: string
}

interface Context {
  dataSources: any
}

export const subscription = {
  Query: {
    async subscription(
      __: any,
      { id }: getSubscriptionPayload,
      { dataSources: { Subscription } }: Context,
      info: any
    ): Promise<SubscriptionDoc> {
      Logger.info('Inside subscription Resolvers')
      try {
        const subscription = await Subscription.getSubscription({ _id: id }, info)
        if (!subscription) {
          throw new UserInputError('Subscription does not exist.')
        }
        subscription.id = subscription._id
        return subscription
      } catch (err) {
        Logger.error(`${err.message}`)
        throw new UserInputError(`${err.message}`)
      }
    },
  },
}
