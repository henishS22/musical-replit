import _ from 'lodash'
import { gamificationList } from './get-all'
import { gamification } from './get'
import { updateEvent } from './update'
import { create } from './create'
import { updateStatus } from './update-status'

export const gamificationResolvers = _.merge(create, gamificationList, gamification, updateEvent, updateStatus)
