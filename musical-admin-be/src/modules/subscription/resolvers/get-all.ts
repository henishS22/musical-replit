import { Logger } from '@core/globals'
import { UserInputError } from 'apollo-server-errors'

export const subscriptions = {
  Query: {
    async subscriptions(__: any, args: any, { dataSources: { Subscription } }, info: any) {
      Logger.info('Inside subscriptions Resolver')

      try {
        args.filters = { ...args.filters, statusMatch: "active", isDeletedBool: "false" }
        const subscriptions = await Subscription.getSubscriptionsList(args, info)
        if (!subscriptions) throw new Error('No subscriptions found')
        return { edges: subscriptions.edges, pageInfo: subscriptions.pageInfo }
      } catch (err) {
        Logger.error(`${err}`)
        throw new UserInputError(`${err.message}`)
      }
    },
  },
}