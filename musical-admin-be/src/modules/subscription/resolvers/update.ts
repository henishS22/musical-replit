import { Logger } from '@core/globals';
import { UserInputError } from 'apollo-server-errors';
import { validateUpdateSubscription } from '../validators/subscription';

export const update = {
  Mutation: {
    async updateSubscription(
      __: any,
      { where: { id }, input },
      { dataSources: { Subscription } }
    ) {
      Logger.info('Inside updateSubscription resolver');
      try {
        // Validate the input payload
        validateUpdateSubscription(input);
        
        // Check if the subscription exists
        const existingSubscription = await Subscription.getSubscription(id);
        if (!existingSubscription) {
          throw new UserInputError(`Subscription with ID ${id} does not exist`);
        }

        // Update the subscription
        const updatedSubscription = await Subscription.updateSubscription(id, existingSubscription, input);
        updatedSubscription.id = updatedSubscription._id;
        return {
          status: true,
          message: 'Subscription updated successfully',
          subscription: updatedSubscription,
        };
      } catch (err) {
        Logger.error(`${err.message}`);
        throw new UserInputError(`${err.message}`);
      }
    },
  },
};