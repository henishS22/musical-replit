import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'
import _ from 'lodash'
import { Password } from '@helpers/password'
import JWTHelper from '@helpers/jwt'
import TwilioHelper from '@helpers/twilio'
import { Role } from '@core/constants/roles'

interface SignInAttrs {
	input: {
		email: string
		password: string
		grantType: string
		code?: string
		secret?: string
	}
}

interface SignInResponse {
	message: string
	token?: string
	isFirstLogin?: boolean
	referenceCode?: string
	qrCode?: string
	accountTypeCode?: Role
	status: string
	mobile?: string
	countryCode?: string
	userId?: string
}

export const signIn = {
	Mutation: {
		signIn: async (
			__,
			{ input }: SignInAttrs,
			{ dataSources: { Auth } }
		): Promise<SignInResponse> => {
			Logger.info('Inside signIn Mutation')
			try {
				const { email, password, grantType, code } = input
				console.log(input, "input 123")
				// Fetch user
				const query = _.pickBy({ email, isActive: true, isDeleted: false }, _.identity)

				const user = await Auth.getUserForAuth(query)

				if (!user) {
					return {
						message: 'Invalid Credentials',
						status: 'error',
					}
				}
				if (grantType === 'PASSWORD') {
					if (!password || !(await Password.compare(password, user.password))) {
						return {
							message: 'Invalid Credentials',
							status: 'error',
						}
					}
					if (user.accountTypeCode === 'SUPER_ADMIN') {
						await user.create2FACodeSuperAdmin()
						await user.save()

						const verificationTwoFA = _.findLast(user.verification, ['codeType', 'twoFA'])
						//For QA testing the OTP is static
						// const options = {
						// 	body: `Verification code for your Musical login is ${verificationTwoFA.code}`,
						// 	to: `${user.countryCode}${user.mobile}`,
						// }

						// // Send message with verification code.
						// await TwilioHelper.Send(options)

						return {
							message: 'Two FA created successfully.',
							referenceCode: verificationTwoFA.referenceCode,
							mobile: user.mobile.toString().slice(user.mobile.toString().length - 4),
							countryCode: user.countryCode,
							accountTypeCode: user.accountTypeCode,
							status: 'success',
						}
					} else {
						// Create new twoFA code
						await user.create2FACode()
						await user.save()

						const verificationTwoFA = _.findLast(user.verification, ['codeType', 'twoFA'])

						const options = {
							body: `Verification code for your Musical login is ${verificationTwoFA.code}`,
							to: `${user.countryCode}${user.mobile}`,
						}

						// Send message with verification code.
						await TwilioHelper.Send(options)

						return {
							message: 'Two FA created successfully.',
							referenceCode: verificationTwoFA.referenceCode,
							mobile: user.mobile.toString().slice(user.mobile.toString().length - 4),
							countryCode: user.countryCode,
							accountTypeCode: user.accountTypeCode,
							status: 'success',
						}
					}
				}

				const verificationTwoFA = _.findLast(user.verification, ['codeType', 'twoFA'])

				if (!code || verificationTwoFA.code !== code) {
					throw new UserInputError('Invalid code.')
				}

				// Nullify twoFA code
				const isFirstLogin = user.isFirstLogin
				user.isFirstLogin = false
				await user.delete2FACode()
				user.mobileVerifiedAt = new Date()
				await user.save()

				// Generate a new JWT token
				const token = JWTHelper.GenerateToken({
					_id: user._id.toString(),
					accountTypeCode: user.accountTypeCode,
				})

				return {
					message: 'Login Successful.',
					isFirstLogin,
					token,
					accountTypeCode: user.accountTypeCode,
					status: 'success',
					userId: user?._id,
				}
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(err.message)
			}
		},
	},
}
