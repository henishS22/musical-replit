import _ from 'lodash'
import { checkUserNameExist } from './check-username'
import { checkUserEmailExist } from './check-email'
import { profile } from './profile'
import { updateProfile } from './update-proflie'
export const meResolvers = _.merge(checkUserNameExist, checkUserEmailExist, profile, updateProfile)
