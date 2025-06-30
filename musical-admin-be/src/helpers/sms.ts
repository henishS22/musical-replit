import { App, Logger } from '@core/globals';
import { Twilio } from 'twilio';

const client = new Twilio(App.Config.TWILIO.SID, App.Config.TWILIO.TOKEN);
const twilioNumber = App.Config.TWILIO.FROM;

const sendOTP = async (mobileNo: string, msg: string) => {
	Logger.info('Inside Twilio Helper');

	return client.messages
		.create({
			body: msg,
			from: twilioNumber,
			to: mobileNo,
		})
		.then((message) => {
			Logger.warn(message);
		})
		.catch((error) => {
			Logger.error('Error sending SMS:', error);
		});
};

export default sendOTP;