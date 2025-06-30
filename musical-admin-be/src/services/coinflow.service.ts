import axios from 'axios';
import { App } from '@core/globals'
import { Logger } from '@core/globals';

interface CoinflowPlanInput {
  name: string;
  code: string;
  interval: string;
  duration?: number;
  amount: {
    cents: number;
    currency: string;
  };
  description?: string;
  transaction?: string;
  settlementType?: string;
}

export class CoinflowService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = process.env.COINFLOW_API_KEY || ''
    this.baseUrl = process.env.COINFLOW_BASE_URL || 'https://api-sandbox.coinflow.cash';

    if (!this.apiKey) {
      Logger.error('COINFLOW_API_KEY is not defined in environment variables');
    }
  }

  /**
   * Create a subscription plan in Coinflow
   * @param planData Plan data to create in Coinflow
   * @returns The created plan data including the Coinflow plan ID
   */
  async createPlan(planData: CoinflowPlanInput): Promise<any> {
    try {
      Logger.info('Creating plan in Coinflow');
      const response = await axios.post(
        `${this.baseUrl}/api/merchant/subscription/plans`,
        planData,
        {
          headers: {
            'Authorization': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      Logger.info(`Plan created successfully in Coinflow with ID: ${response.data.id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Logger.error(`Coinflow API error: ${error.response?.data?.message || error.message}`);
        throw new Error(`Coinflow API error: ${error.response?.data?.message || error.message}`);
      } else {
        Logger.error(`Unexpected error creating Coinflow plan: ${error}`);
        throw new Error(`Unexpected error creating Coinflow plan: ${error}`);
      }
    }
  }

  /**
 * Update a subscription plan in Coinflow
 * @param planData Plan data to update in Coinflow
 * @returns The updated plan data
 */
  async updatePlan(coinflowPlanId: string, planData: CoinflowPlanInput): Promise<any> {
    try {
      Logger.info('Updating plan in Coinflow');
      if (!coinflowPlanId || coinflowPlanId === '') {
        throw new Error('Coinflow plan ID is required to update a plan');
      }
      const response = await axios.put(
        `${this.baseUrl}/api/merchant/subscription/plans/${coinflowPlanId}`,
        planData,
        {
          headers: {
            'Authorization': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      Logger.info(`Plan updated successfully in Coinflow for ID: ${response.data.id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Logger.error(`Coinflow API error: ${error.response?.data?.message || error.message}`);
        throw new Error(`Coinflow API error: ${error.response?.data?.message || error.message}`);
      } else {
        Logger.error(`Unexpected error updating Coinflow plan: ${error}`);
        throw new Error(`Unexpected error updating Coinflow plan: ${error}`);
      }
    }
  }

  /**
* Deactivate a subscription plan in Coinflow
* @param coinflowPlanId coinflow planId to deactivate in Coinflow
* @returns true if the plan is deactivated successfully
*/
  async deactivatePlan(coinflowPlanId: string): Promise<any> {
    try {
      Logger.info('Deactivate plan in Coinflow');
      if (!coinflowPlanId || coinflowPlanId === '') {
        throw new Error('Coinflow plan ID is required to deactivate a plan');
      }
      await axios.delete(
        `${this.baseUrl}/api/merchant/subscription/plans/${coinflowPlanId}`,
        {
          headers: {
            'Authorization': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      Logger.info(`Plan deactivated successfully in Coinflow for ID: ${coinflowPlanId}`);
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Logger.error(`Coinflow API error: ${error.response?.data?.message || error.message}`);
        throw new Error(`Coinflow API error: ${error.response?.data?.message || error.message}`);
      } else {
        Logger.error(`Unexpected error deactivating Coinflow plan: ${error}`);
        throw new Error(`Unexpected error deactivating Coinflow plan: ${error}`);
      }
    }
  }

  /**
   * Map subscription data to Coinflow plan format
   * @param subscriptionData Subscription data from GraphQL input
   * @returns Formatted data for Coinflow API
   */
  mapSubscriptionToCoinflowPlan(subscriptionData: any): CoinflowPlanInput {
    const mappedForCoinFlowPlan = {
      name: subscriptionData.name,
      code: subscriptionData.planCode,
      interval: subscriptionData.interval,
      amount: {
        cents: subscriptionData.price * 100,
        currency: subscriptionData.currency || 'USD'
      },
      settlementType: 'USDC'
    }

    if (subscriptionData?.duration) mappedForCoinFlowPlan['duration'] = subscriptionData.duration
    if (subscriptionData?.description) mappedForCoinFlowPlan['description'] = subscriptionData.description

    return mappedForCoinFlowPlan
  }
}

export default new CoinflowService();