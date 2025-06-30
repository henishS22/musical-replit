import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'
import _ from 'lodash'
import TwilioHelper from '@helpers/twilio'

interface updateMobileAttrs {
	input: {
		id: string
		mobile: string
		grantType: string
		code?: string
		countryCode: string
	}
}

interface updateMobileResponse {
	message: string
	referenceCode?: string
	status: string
	mobile?: string
	countryCode?: string
}

export const updateMobile = {
	Mutation: {
		updateMobile: async (
			__,
			{ input }: updateMobileAttrs,
			{ dataSources: { Auth } }
		): Promise<updateMobileResponse> => {
			Logger.info('Inside updateMobile Mutation')
			try {
				const { id, mobile, grantType, code, countryCode } = input

				// Fetch user
				const query = _.pickBy({ _id: id, isActive: true, isDeleted: false }, _.identity)

				const user = await Auth.getUserForAuth(query)

				if (!user) {
					throw new UserInputError('Invalid Credentials.')
				}

				if (mobile) {
					const existingMobile = await Auth.checkExistingUser({ mobile })

					if (existingMobile) return { message: 'Mobile already taken', status: 'error' }
				}

				if (grantType === 'UPDATE') {
					// Create new twoFA code
					await user.create2FACode()
					await user.save()

					const verificationTwoFA = _.findLast(user.verification, ['codeType', 'twoFA'])

					const options = {
						body: `Verification code for your Musical update mobile number : ${verificationTwoFA.code}`,
						to: `${countryCode}${mobile}`,
					}

					//Send message with verification code.
					await TwilioHelper.Send(options)

					return {
						message: 'Two FA created successfully.',
						referenceCode: verificationTwoFA.referenceCode,
						status: 'success',
						mobile: user.mobile.toString().slice(user.mobile.toString().length - 4),
						countryCode: user.countryCode,
					}
				}

				const verificationTwoFA = _.findLast(user.verification, ['codeType', 'twoFA'])

				if (!code || verificationTwoFA.code !== code) {
					throw new UserInputError('Invalid code.')
				}

				// Nullify twoFA code
				await user.delete2FACode()
				user.mobile = mobile
				user.countryCode = countryCode
				user.mobileVerifiedAt = new Date()
				await user.save()
				// TODO: add last login stuff here


				return {
					message: 'Mobile number was updated successfully.',
					status: 'success',
				}
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(err.message)
			}
		},
	},
}
