import _ from 'lodash'
import { user } from './get'
import { users } from './get-all'
import { usersRequests } from './get-all-requests'
import { verifyUser } from './verify'
import { blockUser } from './block'
import { search } from './search'
import { followUser } from './follow-user'
import { userFollowers } from './get-followers'
import { unfollowUser } from './unfollow-user'
import { updateSocialLink } from './update-social-links'
import { uploadImage } from './upload'
import { askQuestion } from './ask-question'
import { banUser } from './ban'
import { account } from './getAccounts'

export const userResolvers = _.merge(
	user,
	users,
	verifyUser,
	blockUser,
	usersRequests,
	search,
	followUser,
	userFollowers,
	unfollowUser,
	updateSocialLink,
	usersRequests,
	uploadImage,
	askQuestion,
	banUser,
	account
)
