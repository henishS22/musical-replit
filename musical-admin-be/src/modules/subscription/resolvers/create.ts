import { Logger } from '@core/globals'
import { UserInputError } from 'apollo-server-errors'
import { validateCreateSubscription } from '../validators/subscription'

export const create = {
  Mutation: {
    async createSubscription(
      __: any,
      { input },
      { dataSources: { Subscription } }) {
      Logger.info('Inside createSubscription resolver')
      try {
        // Validate the input payload
        validateCreateSubscription(input)

        // Check if a subscription with the same planCode already exists
        const existingSubscription = await Subscription.checkExistingSubscription({
          planCode: input.planCode,
        })

        if (existingSubscription) {
          throw new UserInputError(`Subscription with planCode ${input.planCode} already exists`)
        }

        const subscription = await Subscription.createSubscription(input)
        return {
          status: true,
          message: 'Subscription created successfully',
          subscription
        }
      } catch (err) {
        Logger.error(`${err.message}`)
        throw new UserInputError(`${err.message}`)
      }
    },
  }
}