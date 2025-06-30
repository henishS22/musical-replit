// import speakeasy from 'speakeasy'
// import qrcode from 'qrcode'
// import _ from 'lodash'
// import { App, Logger } from '@core/globals'

// class GoogleAuthenticator {
// 	public async createGoogleAuthSecret(payload: { email: string }): Promise<any> {
// 		Logger.info('Inside createGoogleAuthSecret')
// 		try {
// 			const { email } = payload
// 			const secretCode = speakeasy.generateSecret({
// 				name: 'Multivac',
// 				length: 15,
// 			})
// 			const { base32, otpauth_url } = secretCode
// 			const qrCode = await qrcode.toDataURL(otpauth_url)
// 			if (qrCode) {
// 				const user = await App.Models.User.findOne({ email })
// 				await user.createGoogleAuthCode(base32)
// 				await user.save()
// 				return otpauth_url
// 				// secretCode: base32,
// 			}
// 			return 'Invalid Secret'
// 		} catch (error) {
// 			Logger.error(error)
// 		}
// 	}

// 	public async verifyGoogleAuth(payload: { email: string; code: string }): Promise<boolean> {
// 		Logger.info('Inside verifyGoogleAuth')
// 		try {
// 			const { code, email } = payload
// 			const user = await App.Models.User.findOne({ email }, '+verification')
// 			if (user) {
// 				const secret = _.find(user.verification, (el) => el.codeType === 'googleAuth').code
// 				const verified = speakeasy.totp.verify({
// 					secret,
// 					encoding: 'base32',
// 					token: code,
// 				})
// 				if (verified) {
// 					// await user.deleteGoogleAuthCode()
// 					// await user.save()
// 					Logger.warn('Google Authentication verified')
// 					return true
// 				}
// 			}
// 			Logger.warn('Invalid Code!')
// 			return false
// 		} catch (error) {
// 			Logger.error(error)
// 		}
// 	}
// }

// export default new GoogleAuthenticator()
