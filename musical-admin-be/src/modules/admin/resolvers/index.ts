import _ from 'lodash'
import { admins } from './get-all'
import { create } from './create'
import { admin } from './get'
import { update } from './update'
import { remove } from './delete'
import { disableAdmin } from './disable-admin'
import { enableAdmin } from './enable-admin'
import { getProfile } from './me'
import { getRequests } from './getUserRequest'

export const adminResolvers = _.merge(
	admins,
	create,
	admin,
	update,
	remove,
	disableAdmin,
	enableAdmin,
	getProfile,
	getRequests,
)
