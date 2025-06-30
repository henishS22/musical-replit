import { Logger } from '@core/globals';
import { UserInputError } from 'apollo-server-errors';

export const deleteSubscription = {
  Mutation: {
    async deleteSubscription(
      __: any,
      { where: { id } },
      { dataSources: { Subscription } }
    ) {
      Logger.info('Inside deleteSubscription resolver');
      try {
        if (!id) {
          throw new UserInputError('ID is required in the where clause');
        }

        // Check if the subscription exists
        const existingSubscription = await Subscription.getSubscription(id);
        if (!existingSubscription) {
          throw new UserInputError(`Subscription with ID ${id} does not exist`);
        }

        // Mark the subscription as deleted
        await Subscription.deleteSubscription(id, existingSubscription);

        return {
          status: true,
          message: 'Subscription deleted successfully',
        };
      } catch (err) {
        Logger.error(`${err.message}`);
        throw new UserInputError(`${err.message}`);
      }
    },
  },
};