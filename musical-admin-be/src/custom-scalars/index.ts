import _ from 'lodash'
import { dateResolver } from './date'
import { Anything } from './object'

export const customScalarResolvers = _.merge(dateResolver, Anything)
