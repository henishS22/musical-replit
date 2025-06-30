import { and, or, rule, shield } from 'graphql-shield'
import { App, Logger } from '@core/globals'
import { Role } from '@core/constants/roles'
import { createRateLimitRule } from 'graphql-rate-limit'

interface JwtReturnedUser {
	_id: string
	roleId: any
	permissions: number[]
	accountTypeCode: Role
}

const checkPermission = (user: JwtReturnedUser, permission: number): boolean => {
	if (user) {
		return user.roleId.permissions.includes(permission)
	}
	return false
}

const isAuthenticated = rule()((__: any, ___: any, { user }) => {
	Logger.info('Inside isAuthenticated Middleware')

	return !!user
})

const canReadOwnUser = rule()((__: any, ___: any, { user }) => {
	Logger.info('Inside canReadOwnUser Middleware')
	return checkPermission(user, 1002)
})

const isReadingOwnUser = rule()((__: any, { id }, { user }) => {
	Logger.info('Inside isReadingOwnUser Middleware')
	return user && user.sub === id
})

const canReadAllAdmins = rule()((__: any, ___: any, { user }) => {
	Logger.info('Inside canReadAllAdmins Middleware')
	if (user.accountTypeCode === 'SUPER_ADMIN') return true
	return checkPermission(user, 2000)
})

const canCreateAdmin = rule()((__: any, ___: any, { user }) => {
	Logger.info('Inside canCreateAdmin Middleware')
	return checkPermission(user, 2001)
})

const canReadAdmin = rule()((__: any, ___: any, { user }) => {
	Logger.info('Inside canReadAdmin Middleware')
	return checkPermission(user, 2000)
})

const canUpdateAdmin = rule()((__: any, ___: any, { user }) => {
	Logger.info('Inside canUpdateAdmin Middleware')
	return checkPermission(user, 2002)
})

const canDeleteAdmin = rule()((__: any, ___: any, { user }) => {
	Logger.info('Inside canDeleteAdmin Middleware')
	return checkPermission(user, 2003)
})

const canBanUser = rule()((__: any, ___: any, { user }) => {
	Logger.info('Inside canVerifyUser Middleware')
	return checkPermission(user, 3000)
})

const canReadAllUser = rule()((__: any, ___: any, { user }) => {
	Logger.info('Inside canReadAdmin Middleware')
	return checkPermission(user, 3001)
})

const canReadUser = rule()((__: any, ___: any, { user }) => {
	Logger.info('Inside canReadAdmin Middleware')
	return checkPermission(user, 3001)
})

const canReadRole = rule()((__: any, ___: any, { user }) => {
	Logger.info('Inside canReadRole Middleware')
	return checkPermission(user, 4001)
})

const canReadAllRole = rule()((__: any, ___: any, { user }) => {
	Logger.info('Inside canReadAllRole Middleware')
	if (user.accountTypeCode === 'SUPER_ADMIN') return true
	return checkPermission(user, 4001)
})

const canCreateRole = rule()((__: any, ___: any, { user }) => {
	Logger.info('Inside canCreateRole Middleware')
	return checkPermission(user, 4002)
})

const canUpdateRole = rule()((__: any, ___: any, { user }) => {
	Logger.info('Inside canUpdateRole Middleware')
	return checkPermission(user, 4003)
})

const canDeleteRole = rule()((__: any, ___: any, { user }) => {
	Logger.info('Inside canDeleteRole Middleware')
	return checkPermission(user, 4004)
})

const canDistroPermission = rule()((__: any, ___: any, { user }) => {
	Logger.info('Inside canDistroPermission Middleware')
	return checkPermission(user, 6000)
})

const canSubscriptionPermission = rule()((__: any, ___: any, { user }) => {
	Logger.info('Inside canSubscriptionPermission Middleware')
	return checkPermission(user, 5004)
})

const canReleasePermission = rule()((__: any, ___: any, { user }) => {
	Logger.info('Inside canSubscriptionPermission Middleware')
	return checkPermission(user, 7000)
})


/** API Rate Limit Configuration */
const rateLimitRule = createRateLimitRule({ identifyContext: (ctx) => ctx.id })

const rateLimiterOption = {
	window: App.Config.RATE_LIMITER_TIME_IN_SEC || '5',
	max: +App.Config.RATE_LIMITER_REQUEST_COUNT || 10
}


export default shield(
	{
		Query: {
			// ping: and(rateLimitRule(rateLimiterOption), or(and(canReadOwnUser, isReadingOwnUser), isAuthenticated)),

			admins: and(rateLimitRule(rateLimiterOption), canReadAllAdmins),
			admin: and(rateLimitRule(rateLimiterOption), canReadAdmin),

			users: and(rateLimitRule(rateLimiterOption), canReadAllUser),
			user: and(rateLimitRule(rateLimiterOption), canReadUser),


			roles: and(rateLimitRule(rateLimiterOption), canReadAllRole),
			role: and(rateLimitRule(rateLimiterOption), canReadRole),

			me: and(rateLimitRule(rateLimiterOption), isAuthenticated),
			usersRequests: and(rateLimitRule(rateLimiterOption), isAuthenticated),
			profile: and(rateLimitRule(rateLimiterOption), isAuthenticated),

			distroList: and(rateLimitRule(rateLimiterOption), canDistroPermission),
			distro: and(rateLimitRule(rateLimiterOption), canDistroPermission),

			// subscriptions: and(rateLimitRule(rateLimiterOption), canSubscriptionPermission),
			// subscriptionFeatures: and(rateLimitRule(rateLimiterOption), canSubscriptionPermission),
			// subscription: and(rateLimitRule(rateLimiterOption), canSubscriptionPermission),

			release: and(rateLimitRule(rateLimiterOption), canReleasePermission),
			releaseList: and(rateLimitRule(rateLimiterOption), canReleasePermission),
		},
		Mutation: {

			disableAdmin: and(rateLimitRule(rateLimiterOption), isAuthenticated),
			verifyEmail: and(rateLimitRule(rateLimiterOption), isAuthenticated),
			updateMobile: and(rateLimitRule(rateLimiterOption), isAuthenticated),
			updatePassword: and(rateLimitRule(rateLimiterOption), isAuthenticated),
			checkUserNameExist: and(rateLimitRule(rateLimiterOption), isAuthenticated),
			checkUserEmailExist: and(rateLimitRule(rateLimiterOption), isAuthenticated),
			updateProfile: and(rateLimitRule(rateLimiterOption), isAuthenticated),


			createAdmin: and(rateLimitRule(rateLimiterOption), canCreateAdmin),
			updateAdmin: and(rateLimitRule(rateLimiterOption), canUpdateAdmin),
			deleteAdmin: and(rateLimitRule(rateLimiterOption), canDeleteAdmin),

			createRole: and(rateLimitRule(rateLimiterOption), canCreateRole),
			updateRole: and(rateLimitRule(rateLimiterOption), canUpdateRole),
			deleteRole: and(rateLimitRule(rateLimiterOption), canDeleteRole),

			banUser: and(rateLimitRule(rateLimiterOption), canBanUser),

			distroStatus: and(rateLimitRule(rateLimiterOption), canDistroPermission),

			// createSubscription: and(rateLimitRule(rateLimiterOption), canSubscriptionPermission),
			// deleteSubscription: and(rateLimitRule(rateLimiterOption), canSubscriptionPermission),
			// updateSubscription: and(rateLimitRule(rateLimiterOption), canSubscriptionPermission),
		},
	},

	{
		allowExternalErrors: true,
		fallbackError: 'The user is not authorized to access this Page',
	}
)
