import _ from 'lodash'
import { distroList } from './get-all'
import { distro } from './get'
import { distroStatus } from './update'

export const distroResolvers = _.merge(distroList, distro, distroStatus)
