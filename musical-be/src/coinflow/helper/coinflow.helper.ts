import { Logger } from '@nestjs/common';
import axios from 'axios';

class CoinflowHelper {
  private apiKey: string;
  private baseUrl: string;
  private merchantId: string;

  constructor() {
    const apiKey = process.env.COINFLOW_API_KEY;
    const baseUrl = process.env.COINFLOW_BASE_URL;
    const merchantId = process.env.COINFLOW_MERCHANT_ID;

    if (!apiKey || !baseUrl) {
      throw new Error(
        'Coinflow API configuration is missing. Please set COINFLOW_API_KEY and COINFLOW_BASE_URL.',
      );
    }
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.merchantId = merchantId;
  }

  public async getSubscriptionPlans() {
    try {
      const { data } = await axios.get(
        `${this.baseUrl}/api/subscription/${this.merchantId}/plans`,
        {
          headers: {
            Authorization: `${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return data;
    } catch (error) {
      if (error) {
        Logger.error('Error fetching Coinflow subscription plans', {
          error: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
      } else {
        Logger.error('Unexpected error fetching subscription plans', {
          error,
        });
      }
      throw new Error('Failed to fetch Coinflow subscription plans');
    }
  }

  public async getSubscriptionPlan(code: string) {
    try {
      const { data } = await axios.get(
        `${this.baseUrl}/api/subscription/${this.merchantId}/plans/${code}`,
        {
          headers: {
            Authorization: `${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return data;
    } catch (error) {
      if (error) {
        Logger.error('Error fetching Coinflow subscription plans', {
          error: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
      } else {
        Logger.error('Unexpected error fetching subscription plans', {
          error,
        });
      }
      throw new Error('Failed to fetch Coinflow subscription plans');
    }
  }

  public async cancelSubscription(params: any) {
    try {
      const { id, wallet } = params;
      const data = await axios.patch(
        `${this.baseUrl}/api/subscription/${this.merchantId}/subscribers/${id}`,
        {},
        {
          headers: {
            'x-coinflow-auth-session-key': `${wallet}`,
          },
        },
      );
      return data;
    } catch (error) {
      if (error) {
        Logger.error('Error canceling Coinflow subscription', {
          error: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
      } else {
        Logger.error('Unexpected error canceling subscription', {
          error,
        });
      }
      throw new Error('Failed to cancel Coinflow subscription');
    }
  }
}

export default new CoinflowHelper();
