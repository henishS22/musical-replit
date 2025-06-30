import _ from 'lodash'
import { roles } from './get-all'
import { create } from './create'
import { role } from './get'
import { remove } from './delete'
import { update } from './update'

export const rolesResolvers = _.merge(roles, create, role, remove, update)
