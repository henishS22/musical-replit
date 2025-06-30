import _ from 'lodash'
import { create } from './create'
import { subscriptions } from './get-all'
import { subscription } from './get'
import { subscriptionFeatures } from './get-features'
import { update } from './update'
import { deleteSubscription } from './delete'

export const subscriptionResolvers = _.merge(create, subscriptions, subscription, subscriptionFeatures, update, deleteSubscription)
