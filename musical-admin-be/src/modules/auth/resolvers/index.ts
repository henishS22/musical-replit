import _ from 'lodash'
import { signIn } from './sign-in'
import { resetPassword } from './reset-password'
import { updateMobile } from './update-mobile'
import { updatePassword } from './update-password'

export const authResolvers = _.merge(signIn, resetPassword, updateMobile, updatePassword)
