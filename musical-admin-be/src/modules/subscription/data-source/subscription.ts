import { UserInputError } from 'apollo-server-errors'
import { MongoDataSource } from 'apollo-datasource-mongodb'
import { Logger } from '@core/globals'
import ProjectionField from '@helpers/projection-field'
import { create, update, checkFlag, detailById } from '@helpers/mongoose'
import coinflowService from '../../../services/coinflow.service'
import { SubscriptionDoc } from '@models/subscription'
import { PlanInterval } from '@core/constants/subscription'
import mongoose from 'mongoose'
import QueryResolver from '@helpers/query-resolver'
import { GraphQLInput, PageResponse, PageInfo, Edge } from '@modules/role/data-source/role'
import Pagination from '@helpers/pagination'
import _ from 'lodash'
const { ObjectId } = mongoose.Types

export default class SubscriptionDataSource extends MongoDataSource<SubscriptionDoc> {
  private subscriptionPagination: any
  constructor(Subscription) {
    super(Subscription)
    this.subscriptionPagination = new Pagination(Subscription)
  }

  public async createSubscription(payload: any): Promise<any> {
    Logger.info('Inside createSubscription Datasource Service')
    try {
      const subscriptionData = {
        ...payload,
      };
      if (payload.interval === PlanInterval['MONTHLY'] || payload.interval === PlanInterval['YEARLY']) {
        // Create plan in Coinflow first
        const coinflowPlanData = coinflowService.mapSubscriptionToCoinflowPlan(payload);
        const coinflowPlan = await coinflowService.createPlan(coinflowPlanData);

        // Add the Coinflow plan ID to our subscription data
        subscriptionData.coinflowPlanId = coinflowPlan.id
      }

      subscriptionData.status = 'active'
      subscriptionData.createdById = new ObjectId(payload.createdById)
      subscriptionData.updatedById = new ObjectId(payload.createdById)
      // Create subscription in our database
      const subscription = await create(this.model, subscriptionData);
      return subscription
    } catch (err) {
      Logger.error(`${err.message}`)
      throw new UserInputError(`${err.message}`)
    }
  }

  public async updateSubscription(id: string, existingSubscription: any, data: any): Promise<any> {
    Logger.info('Inside updateSubscription Datasource Service');
    try {
      // Validate the fields to be updated
      const allowedFields = ['name', 'planCode', 'description', 'price', 'features', 'updatedById'];
      const updateData = Object.keys(data)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = data[key];
          return obj;
        }, {});

      if (!Object.keys(updateData).length) {
        throw new UserInputError('No valid fields provided for update');
      }

      // Update subscription in Coiflow
      if (existingSubscription.coinflowPlanId && existingSubscription.coinflowPlanId !== '') {
        // Create mapping for coinflow update request
        const payload = {
          ...existingSubscription,
          ...data
        }
        const coinflowPlanData = coinflowService.mapSubscriptionToCoinflowPlan(payload);
        await coinflowService.updatePlan(payload.coinflowPlanId, coinflowPlanData);
      }

      // Perform the update
      const updatedSubscription = await update(this.model, { _id: id, isDeleted: false }, updateData);
      return updatedSubscription;
    } catch (err) {
      Logger.error(`${err.message}`);
      throw new UserInputError(`${err.message}`);
    }
  }

  public async getSubscriptions(filter: { type?: string, search?: string }, info: any): Promise<any[]> {
    Logger.info('Inside getSubscriptions Datasource Service')
    try {
      const query: any = { status: 'active' }
      if (filter.type) {
        query['type'] = filter.type
      }
      // Apply search filter if provided
      if (filter?.search && filter.search !== '') {
        query.$or = [
          { name: { $regex: filter.search, $options: 'i' } },
          { planCode: { $regex: filter.search, $options: 'i' } },
        ];
      }
      const projection = await ProjectionField.ParseProjectionField(info, this.model.schema.obj)
      return this.model.find(query, projection)
    } catch (err) {
      Logger.error(`${err.message}`)
      throw new UserInputError(`${err.message}`)
    }
  }

  public async checkExistingSubscription(query: any): Promise<boolean> {
    Logger.info('Inside checkExistingSubscription Datasource Service')
    try {
      return checkFlag(this.model, query)
    } catch (err) {
      Logger.error(`${err.message}`)
      throw new UserInputError(`${err.message}`)
    }
  }

  public getSubscription(id: string): Promise<any> {
    Logger.info('Inside getSubscription Datasource Service')
    try {
      return detailById(this.model, id)
    } catch (err) {
      Logger.error(`${err.message}`)
      throw new UserInputError(`${err.message}`)
    }
  }

  public async deleteSubscription(id: string, existingSubscription: any): Promise<any> {
    Logger.info('Inside deleteSubscription Datasource Service')
    try {
      if (existingSubscription.coinflowPlanId && existingSubscription.coinflowPlanId !== '') {
        // Deactivate the plan in Coinflow
        await coinflowService.deactivatePlan(existingSubscription.coinflowPlanId);
      }
      return update(this.model, { _id: id, isDeleted: false }, { isDeleted: true, status: 'deactivated' })
    } catch (err) {
      Logger.error(`${err.message}`)
      throw new UserInputError(`${err.message}`)
    }
  }

  public async getSubscriptionsList(
    { after, before, first, last, orderBy, filters }: GraphQLInput,
    info: any
  ): Promise<PageResponse> {
    Logger.info('Inside getSubscriptionsList Datasource Service')
    try {
      const sort = QueryResolver.GetSortObj(orderBy)

      let filter = {}
      if (filters && Object.keys(filters).length > 0) filter = QueryResolver.GetFilterObj(filters)

      const queryArgs = _.pickBy({ after, before, first, last, filter, sort }, _.identity)

      const projection = await ProjectionField.ParseProjectionField(info, this.model.schema.obj)

      const edges: Edge[] = await this.subscriptionPagination.GetEdges(queryArgs, projection)

      const pageInfo: PageInfo | any = await this.subscriptionPagination.GetPageInfo(edges, queryArgs)

      return { edges, pageInfo }
    } catch (err) {
      Logger.error(`${err.message}`)
      throw new UserInputError(`${err.message}`)
    }
  }
}