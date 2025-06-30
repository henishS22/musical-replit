import _ from 'lodash'
import { Logger } from '@core/globals'
import { UserInputError } from 'apollo-server-errors'

export interface VerifyEmailAttrs {
	input: {
		email: string
		id: string
	}
}

interface VerifyEmailResponse {
	message: string
}

export const verifyEmail = {
	Mutation: {
		verifyEmail: async (
			__: any,
			{ input }: VerifyEmailAttrs,
			{ dataSources: { Auth } }
		): Promise<VerifyEmailResponse> => {
			Logger.info('Inside verifyEmail Resolver ')
			try {
				const { email, id } = input

				const user = await Auth.getUserForAuth({
					email,
					isActive: true,
					isDeleted: false,
				})

				if (!user) {
					throw new UserInputError('Email verification failed!')
				}

				const verificationEmail = _.findLast(user.verification, [
					'codeType',
					'email',
				])

				if (!verificationEmail || verificationEmail.code !== id) {
					throw new UserInputError('Email verification failed!')
				}

				await user.deleteVerificationCode('email')
				user.emailVerifiedAt = new Date()
				await user.save()

				return { message: 'Email verification successful!' }
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(err.message)
			}
		},
	},
}
