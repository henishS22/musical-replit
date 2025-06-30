import sendOTP from './sms'
class TwilioHelper {
	public async Send(options) {
		const { body, to } = options
		const res = await sendOTP(to, body)

		return res
	}
}

export default new TwilioHelper()
