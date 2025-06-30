import _ from 'lodash'
import { dashboard } from './dashboard'
import { graph } from './graph'
import { userGraph } from './userGraph'
import { sellNftGraph } from './sellNftGraph'

export const dashboardResolvers = _.merge(dashboard, graph, userGraph, sellNftGraph)
