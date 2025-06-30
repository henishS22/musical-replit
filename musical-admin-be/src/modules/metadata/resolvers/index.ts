import _ from 'lodash'
import { releaseList } from './get-all'
import { metadata } from './get'

export const metadataResolvers = _.merge(releaseList, metadata)
