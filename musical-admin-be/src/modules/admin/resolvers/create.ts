import { UserInputError } from 'apollo-server-errors'
import { App, Logger } from '@core/globals'
import { AdminDoc } from '@models/admin'
import { Role } from '@core/constants/roles'
import { GenerateRandomStringOfLength } from '@core/utils'
import AvatarHelper from '@helpers/avatars'
import Email from '@helpers/mail'

interface CreateAdminPayload {
	input: {
		email: string
		mobile: string
		countryCode: string
		roleId: typeof App.ObjectId
		fullName: string
	}
}

interface Context {
	user: AdminDoc
	dataSources: any
}

interface createAdminResponse {
	message: string
	status: string
}

export const create = {
	Mutation: {
		async createAdmin(
			__: any,
			{ input }: CreateAdminPayload,
			{ dataSources, user }: Context
		): Promise<createAdminResponse> {
			Logger.info('Inside createAdmin Resolvers')
			try {
				if (!user)
					return { message: 'Please check the token. User details does not exist', status: 'error' }

				const { email, mobile, countryCode, roleId, fullName } = input

				const existingEmail = await dataSources.Auth.checkExistingUser({ email })

				if (existingEmail) return { message: 'Email already taken', status: 'error' }

				const existingMobile = await dataSources.Auth.checkExistingUser({ mobile })

				if (existingMobile) return { message: 'Mobile already taken', status: 'error' }

				// Getting role's permissions array
				const rolePermissions = await dataSources.Role.getRole(roleId)

				if (!rolePermissions) return { message: 'Invalid role', status: 'error' }
				let roleType = Role.ADMIN
				if (rolePermissions.name === 'SUPER_ADMIN') {
					const superAdminExists = await dataSources.Auth.checkExistingUser({
						accountTypeCode: 'SUPER_ADMIN',
					})

					if (superAdminExists) {
						return { message: 'Cannot create admin with super admin role', status: 'error' }
					}
					roleType = Role.SUPER_ADMIN
				}
				// Generating random password for admin
				const password = GenerateRandomStringOfLength(8)

				const newUser = await dataSources.Admin.create({
					fullName,
					email,
					mobile,
					countryCode,
					roleId,
					createdById: user._id,
					profilePic: AvatarHelper.getAvatar(),
					accountTypeCode: roleType,
					permissions: rolePermissions.permissions,
					// password,
				})
				newUser.password = password
				newUser.save()

				await dataSources.Activity.create({
					userId: newUser._id,
					activities: [],
				})
				await dataSources.Activity.updateActivity(
					{ userId: user._id },
					{
						activities: [`Created new user ${fullName}`],
					}
				)

				new Email({ to: email, name: fullName }).createAdmin({
					createdBy: user?.fullName,
					password: password,
					roleName: 'ADMIN',
					loginUrl: "https://dev-feadmin.musicalapp.com"
				})

				return { message: 'Admin created Successfully', status: 'success' }
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
}
