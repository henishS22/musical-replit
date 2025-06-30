import _ from 'lodash'
import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'

import Email from '@helpers/mail'

export interface ResetPasswordInput {
	input: {
		reqType: string
		email: string
		code: string
		newPassword: string
	}
}

interface ResetPasswordResponse {
	message: string
	referenceCode?: string
}

export const resetPassword = {
	Mutation: {
		resetPassword: async (
			__: any,
			{ input }: ResetPasswordInput,
			{ dataSources: { Auth } }
		): Promise<ResetPasswordResponse> => {
			Logger.info('Inside resetPassword Mutation')
			try {
				const { reqType, email, code, newPassword } = input

				const user = await Auth.getUserForAuth({
					email,
					isActive: true,
					isDeleted: false,
				})

				if (!user) {
					throw new UserInputError('Invalid credentials!')
				}

				// Request for verification code when reqType is REQUEST
				if (reqType === 'REQUEST') {
					// Create new reset-password code
					await user.createResetPasswordCode()
					await user.save()

					const verificationObj = _.findLast(user.verification, ['codeType', 'resetPassword'])

					new Email({ to: email, name: user?.name }).resetPassword({
						otp: verificationObj.code,
					})

					return {
						message: 'Reset Password code sent successfully.',
						referenceCode: verificationObj.referenceCode,
					}
				}

				// When user is having verification code
				if (!code || !newPassword) {
					throw new UserInputError('Invalid input!')
				}

				const verificationObj = _.findLast(user.verification, ['codeType', 'resetPassword'])

				if (!verificationObj || verificationObj.code !== code) {
					throw new UserInputError('Invalid input!')
				}

				await user.deleteResetPasswordCode()
				user.password = newPassword
				await user.save()

				return { message: 'Password Reset successful!' }
			} catch (err) {
				Logger.info(`${err.message}`)
				throw new UserInputError(err.message)
			}
		},
	},
}
