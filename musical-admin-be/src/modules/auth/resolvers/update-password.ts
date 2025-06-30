import _ from 'lodash'
import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'
import { Password } from '@helpers/password'
import TwilioHelper from '@helpers/twilio'

interface UpdateAdminPayload {
	input: {
		email: string
		password: string
		newPassword: string
		grantType: string
		code?: string
	}
}

interface UpdateAdminResponse {
	message: string
	status: string
	referenceCode?: string
	email?: string
	countryCode?: string
	mobile?: string
}

export const updatePassword = {
	Mutation: {
		async updatePassword(
			__: any,
			{ input }: UpdateAdminPayload,
			{ dataSources: { Auth } }
		): Promise<UpdateAdminResponse> {
			Logger.info('Inside updatePassword Resolvers')
			try {
				const { email, password, newPassword, grantType, code } = input
				const query = _.pickBy({ email, isActive: true, isDeleted: false }, _.identity)

				const user = await Auth.getUserForAuth(query)

				if (!password || !(await Password.compare(password, user.password))) {
					return {
						message: 'Invalid Credentials',
						status: 'error',
					}
				}

				if (password === newPassword) {
					return {
						message: 'Both the new and old passwords are the same',
						status: 'error',
					}
				}
				if (grantType === 'UPDATE') {
					// Create new twoFA code
					await user.create2FACode()
					await user.save()

					const verificationTwoFA = _.findLast(user.verification, ['codeType', 'twoFA'])

					const options = {
						body: `Verification code for your Musical update mobile number : ${verificationTwoFA.code}`,
						to: `${user.countryCode}${user.mobile}`,
					}

					//Send message with verification code.
					await TwilioHelper.Send(options)

					return {
						message: 'Two FA created successfully.',
						referenceCode: verificationTwoFA.referenceCode,
						status: 'success',
						email: user.email,
						countryCode: user?.countryCode,
						mobile: user?.mobile,
					}
				}

				const verificationTwoFA = _.findLast(user.verification, ['codeType', 'twoFA'])

				if (!code || verificationTwoFA.code !== code) {
					throw new UserInputError('Invalid code.')
				}
				user.password = newPassword
				await user.save()


				return { message: 'User updated Successfully', status: 'success' }
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
}
