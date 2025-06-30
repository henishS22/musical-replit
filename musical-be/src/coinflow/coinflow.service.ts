import { Injectable, Inject, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Model } from 'mongoose';
import {
  Subscription,
  UserSubscription,
  Transaction,
  TokenTransactionType,
  User,
} from '../schemas/schemas';
import { InjectModel } from '@nestjs/mongoose';
import { UserSubscriptionStatus } from '../schemas/schemas/user-subscription.schema';
import { PaymentMethod } from '../schemas/schemas/transaction.schema';
import coinflowHelper from './helper/coinflow.helper';
import { AyrshareService } from '../ayrshare/ayrshare.service';
import { EventTypeEnum } from '../gamificationEvent/utils/enum';
import { UserActivityService } from '../user-activity/user-activity.service';
import axios from 'axios';
// import { createRegisterDto } from './dto/createRegister.dto';

interface SubscriptionWebhookData {
  userId: string;
  subscriptionId: string;
  subscription: any;
  webhookInfo: any;
  planCode: string;
  amount: number;
  currency: string;
  transactionId: string;
  paymentMethod: PaymentMethod;
  wallet?: string;
  network?: string;
}

@Injectable()
export class CoinflowService {
  private readonly logger = new Logger(CoinflowService.name);

  //Define the microservice to connect
  constructor(
    @Inject(UsersService) private readonly userService: UsersService,
    private readonly ayrshareService: AyrshareService,
    private readonly userActivityService: UserActivityService,

    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
    @InjectModel(UserSubscription.name)
    private userSubscriptionModel: Model<UserSubscription>,
    @InjectModel(Transaction.name)
    private transactionModel: Model<Transaction>,

    @InjectModel(User.name)
    private userModel: Model<User>,
  ) { }

  async getSubscriptions() {
    const subscriptions = await this.subscriptionModel.find({
      type: 'subscription',
      isDeleted: false,
    });
    return subscriptions;
  }

  async getSubscriptionAddons() {
    const subscriptionAddons = await this.subscriptionModel.find({
      type: 'addon',
      isDeleted: false,
    });
    return subscriptionAddons;
  }

  async getSubscriptionDetail(id: string) {
    const subscription = await this.subscriptionModel.findOne({
      _id: id,
      isDeleted: false,
    });
    return subscription;
  }

  async cancelSubscription(data: any): Promise<any> {
    const { id, wallet } = data;
    const userSubscription = await this.userSubscriptionModel.updateMany(
      {
        'coinflow.subscriptionId': id,
        'coinflow.wallet': wallet,
      },
      { $set: { 'coinflow.isCanceled': true } },
    );
    return userSubscription;
  }

  async inaciveAndReassignSubscriptions(): Promise<any> {
    const currentDate = new Date();

    const userSubscriptions: any = await this.userSubscriptionModel
      .find({
        type: 'subscription',
        status: UserSubscriptionStatus.Active,
        endDate: { $lt: currentDate },
      })
      .populate('subscriptionId');
    if (userSubscriptions && userSubscriptions.length) {
      for (let i = 0; i < userSubscriptions.length; i++) {
        const userSubscription = userSubscriptions[i];

        const plansNotOnCoinflow = [];
        const subscriptionsNotOnCoinflow = await this.subscriptionModel.find({
          isOnCoinflow: false,
          type: 'subscription',
        });
        if (subscriptionsNotOnCoinflow && subscriptionsNotOnCoinflow.length) {
          plansNotOnCoinflow.push(
            ...subscriptionsNotOnCoinflow.map((sub) => sub.planCode),
          );
        }

        let planCode = userSubscription.planCode;
        if (
          !plansNotOnCoinflow.includes(planCode) &&
          userSubscription.coinflow?.isCanceled
        ) {
          const freeSubscription = await this.subscriptionModel.findOne({
            isFree: true,
            type: 'subscription',
          });
          if (freeSubscription) {
            planCode = freeSubscription.planCode;
          }
        }

        if (plansNotOnCoinflow.includes(planCode)) {
          const subscription = await this.subscriptionModel.findOne({
            planCode,
          });

          const startDate = new Date();
          const endDate = new Date();
          if (
            subscription.interval === 'Monthly' ||
            subscription.interval === 'Lifetime'
          ) {
            endDate.setMonth(endDate.getMonth() + 1);
          } else if (subscription.interval === 'Yearly') {
            endDate.setFullYear(endDate.getFullYear() + 1);
          }

          // Make an array for usage
          const userSubscriptionFeatures = [];
          if (subscription.features.length) {
            for (let i = 0; i < subscription.features.length; i++) {
              const feature = subscription.features[i];
              if (feature) {
                const userFeature = {
                  featureKey: feature.featureKey,
                  limit: feature.limit,
                  unit: feature.unit,
                };
                userSubscriptionFeatures.push(userFeature);
              }
            }
          }

          // Check if previously used the storage
          const previousUsage: any = userSubscription.usage;
          userSubscriptionFeatures.forEach((feature) => {
            if (feature.featureKey === 'storage') {
              const previousFeature = previousUsage.find(
                (prev: any) => prev.featureKey === 'storage',
              );
              if (previousFeature) {
                feature.usage = previousFeature.usage;
              }
            }
          });
          // Create new subscription
          await this.userSubscriptionModel.create({
            userId: userSubscription.userId,
            subscriptionId: subscription._id,
            name: subscription.name,
            planCode: subscription.planCode,
            startDate,
            endDate,
            subscriptionInterval: subscription.interval,
            type: subscription.type,
            status: UserSubscriptionStatus.Active,
            usage: userSubscriptionFeatures,
          });

          // Inactive previous subscription
          userSubscription.status = UserSubscriptionStatus.Inactive;
          await userSubscription.save();
        }
      }
    }
  }

  async handleSettled(webhookData: any) {
    const { created, data } = webhookData;
    const { id, subscription, webhookInfo, wallet } = data;
    const { customer, nextPaymentAt } = subscription || {};

    console.log(webhookData, '============webhookData=====================');
    try {
      //userId find
      let userId
      if (!webhookInfo?.userId) {
        // const userData = await this.userModel.findOne({ 'wallets.addr': wallet });
        const userData = await this.userModel.findOne({
          'wallets.addr': new RegExp(`^${wallet}$`, 'i'),
        });
        userId = userData?._id
      } else {
        userId = webhookInfo?.userId
      }
      const session = await this.sessionKey(userId.toString())

      //gamification token assign for USER_SUBSCRIBING
      if (webhookInfo?.planCode === 'LIFETIMEPASS' || webhookInfo?.planCode === 'GUILD_KIT') {
        await this.userActivityService.activity(userId, EventTypeEnum.USER_SUBSCRIBING)
      }

      //transaction save for admin data
      const newTransaction = {
        amount: parseFloat(webhookData?.data?.total?.cents) / 100,
        subtotal: {
          cents: parseFloat(webhookData?.data?.subtotal?.cents) / 100,
        },
        fees: {
          cents: parseFloat(webhookData?.data?.fees?.cents) / 100,
        },
        gasFees: {
          cents: parseFloat(webhookData?.data?.gasFees?.cents) / 100,
        },
        total: {
          cents: parseFloat(webhookData?.data?.total?.cents) / 100,
        },
        webhookInfo: {
          userId: userId,
          planCode: webhookData?.data?.webhookInfo?.planCode,
          planId: webhookData?.data?.webhookInfo?.planId,
        },
        subscription: {
          customer: webhookData?.data?.subscription?.customer,
          merchant: webhookData?.data?.subscription?.merchant,
          plan: {
            amount: {
              cents: webhookData?.data?.subscription?.plan?.amount,
              currency: webhookData?.data?.subscription?.plan?.currency,
            },
            merchant: webhookData?.data?.subscription?.merchant,
            name: webhookData?.data?.subscription?.name,
            code: webhookData?.data?.subscription?.code,
            interval: webhookData?.data?.subscription?.interval,
            description: webhookData?.data?.subscription?.description,
            active: webhookData?.data?.subscription?.active,
          },
          fundingMethod: webhookData?.data?.subscription?.fundingMethod,
          reference: webhookData?.data?.subscription?.reference,
          nextPaymentAt: webhookData?.data?.subscription?.nextPaymentAt,
          status: webhookData?.data?.subscription?.status,
          createdAt: webhookData?.data?.subscription?.createdAt,
          updatedAt: webhookData?.data?.subscription?.updatedAt,
        },
      };
      console.log(
        newTransaction,
        '============newTransaction=====================',
      );

      await this.transactionModel.create(newTransaction);

      const subscriptions = await this.subscriptionModel.find({
        status: 'active',
      });
      const planCodes = [
        ...new Set(
          subscriptions.map((subscriptionObj) => subscriptionObj.planCode),
        ),
      ];
      if (planCodes.includes(webhookInfo?.planCode)) {
        // Find the subscription plan
        const subscriptionDoc = await this.subscriptionModel.findOne({
          planCode: webhookInfo?.planCode,
        });
        if (!subscriptionDoc) {
          return {
            isSuccess: false,
          };
        }

        //create ayrshare profile for social_management_suite feature available on subscription
        const socialManagementFeature = subscriptionDoc.features.find(
          (feature) => feature.featureKey === 'social_management_suite'
        );

        const user = await this.userModel.findOne({ _id: userId });

        if (user && !user.ayrshare && socialManagementFeature && socialManagementFeature?.available) {
          // Create Ayrshare profile
          await this.ayrshareService.createProfile(
            { title: user?.username || user?.name },
            user._id.toString(),
          );
        }

        let startDate = null;
        let endDate = null;
        let isCanceled = undefined;
        if (subscriptionDoc.interval !== 'Lifetime') {
          isCanceled = false;
          startDate = new Date(created);
          endDate = new Date(nextPaymentAt);
        } else if (subscriptionDoc.interval == 'Lifetime') {
          startDate = new Date(created);
          endDate = new Date(created);
          endDate.setMonth(endDate.getMonth() + 1);
        }

        // create userSubscriptionFeatures
        const userSubscriptionFeatures = [];
        if (subscriptionDoc.features.length) {
          for (let i = 0; i < subscriptionDoc.features.length; i++) {
            const feature = subscriptionDoc.features[i];
            if (feature) {
              const userFeature = {
                featureKey: feature.featureKey,
                limit: feature.limit,
                unit: feature.unit,
                usage: 0,
              };
              userSubscriptionFeatures.push(userFeature);
            }
          }
        }

        if (subscriptionDoc.type == 'subscription') {
          const previousSubscription = await this.userSubscriptionModel.findOne(
            {
              userId: userId,
              type: 'subscription',
              status: UserSubscriptionStatus.Active,
            },
          );

          // Carry forward storage usage if previous subscription exists
          if (previousSubscription) {
            const previousUsage: any = previousSubscription.usage;
            userSubscriptionFeatures.forEach((feature) => {
              if (feature.featureKey === 'storage') {
                const previousFeature = previousUsage.find(
                  (prev: any) => prev.featureKey === 'storage',
                );
                if (previousFeature) {
                  feature.usage = previousFeature.usage;
                }
              }
            });

            // Cancel the subscription on coinflow if user has previous subscription
            if (
              previousSubscription.coinflow?.subscriptionId &&
              previousSubscription.coinflow?.wallet
            ) {
              const cancelObj = {
                id: previousSubscription.coinflow.subscriptionId,
                wallet: session.key,
              };
              const response = await coinflowHelper.cancelSubscription(
                cancelObj,
              );
              if (response.status == 200) {
                await this.cancelSubscription(cancelObj);
              }
            }
          }

          // Find all existing subscriptions for the user
          await this.userSubscriptionModel.updateMany(
            { userId: userId, type: 'subscription' },
            { $set: { status: UserSubscriptionStatus.Inactive } },
          );

          // Create new subscription
          await this.userSubscriptionModel.create({
            userId: userId,
            subscriptionId: subscriptionDoc._id,
            name: subscriptionDoc.name,
            planCode: subscriptionDoc.planCode,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            type: subscriptionDoc.type,
            subscriptionInterval: subscriptionDoc.interval,
            billingCycle: subscriptionDoc.interval,
            nextBillingDate: nextPaymentAt || undefined,
            status: UserSubscriptionStatus.Active,
            usage: userSubscriptionFeatures,
            coinflow: {
              paymentId: id || undefined,
              customerId: customer || undefined,
              subscriptionId: subscription?._id || undefined,
              isCanceled,
              wallet: wallet || undefined,
            },
          });
          return {
            isSuccess: true,
          };
        } else if (subscriptionDoc.type == 'addon') {
          const previousAddon: any = await this.userSubscriptionModel.findOne({
            userId: userId,
            type: 'addon',
            name: subscriptionDoc.name,
            status: UserSubscriptionStatus.Active,
          });
          // Carry forward storage usage if previous addon exists
          if (previousAddon) {
            if (previousAddon.name == 'Storage') {
              const previousUsage: any = previousAddon.usage;
              userSubscriptionFeatures.forEach((feature) => {
                if (feature.featureKey === 'storage') {
                  const previousFeature = previousUsage.find(
                    (prev: any) => prev.featureKey === 'storage',
                  );
                  if (previousFeature) {
                    feature.usage = previousFeature.usage;
                  }
                }
              });
            }

            // Cancel the subscription on coinflow if user has previous addon
            if (
              previousAddon.coinflow?.subscriptionId &&
              previousAddon.coinflow?.wallet
            ) {
              const cancelObj = {
                id: previousAddon.coinflow.subscriptionId,
                wallet: session.key,
              };
              const response = await coinflowHelper.cancelSubscription(
                cancelObj,
              );
              if (response.status == 200) {
                await this.cancelSubscription(cancelObj);
              }
            }
          }
          // Find all existing subscriptions for the user
          await this.userSubscriptionModel.updateMany(
            {
              userId: userId,
              type: 'addon',
              name: subscriptionDoc.name,
            },
            { $set: { status: UserSubscriptionStatus.Inactive } },
          );

          // Create new subscription
          await this.userSubscriptionModel.create({
            userId: userId,
            subscriptionId: subscriptionDoc._id,
            name: subscriptionDoc.name,
            planCode: subscriptionDoc.planCode,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            type: subscriptionDoc.type,
            subscriptionInterval: subscriptionDoc.interval,
            billingCycle: subscriptionDoc.interval,
            nextBillingDate: nextPaymentAt || undefined,
            status: UserSubscriptionStatus.Active,
            usage: userSubscriptionFeatures,
            coinflow: {
              paymentId: id || undefined,
              customerId: customer || undefined,
              subscriptionId: subscription?._id || undefined,
              isCanceled: isCanceled || undefined,
              wallet: wallet || undefined,
            },
          });
          return {
            isSuccess: true,
          };
        }
      }
      return {
        isSuccess: true,
      };
    } catch (error) {
      throw error;
    }
  }

  async featureAvailability(owner: string) {
    try {
      const subscriptions = await this.userSubscriptionModel.find({ userId: owner, status: UserSubscriptionStatus.Active }).populate('subscriptionId');
      const featuresList = [];
      const userSubscriptionFeatures = []
      subscriptions.forEach((subscription) => {
        userSubscriptionFeatures.push(...subscription['subscriptionId']['features'])
      })
      userSubscriptionFeatures.forEach((feature) => {
        const existingFeature = featuresList.find((f) => f.featureKey === feature.featureKey);
        if (existingFeature) {
          if (!existingFeature.available) {
            existingFeature.available = feature.available;
          }
        } else {
          featuresList.push({
            featureKey: feature.featureKey,
            available: feature.available,
            description: feature.description,
          });
        }
      })
      return featuresList;
    } catch (err) {
      throw new Error(
        'Error fetching user feature availability.' + JSON.stringify(err),
      );
    }
  }

  async sessionKey(owner: string) {
    const response = await axios.get(`${process.env.COINFLOW_BASE_URL}/api/auth/session-key`, {
      headers: {
        'Authorization': process.env.COINFLOW_API_KEY,
        'accept': 'application/json',
        'x-coinflow-auth-user-id': owner.toString(),
      },
    });
    const sessionToken = response?.data ?? null

    return sessionToken
  }
}