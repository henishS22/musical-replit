import { Injectable, Logger } from '@nestjs/common';
import { Twilio } from 'twilio';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private client: Twilio;
  private twilioNumber: string;

  constructor() {
    this.client = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_ACCOUNT_KEY);
    this.twilioNumber = process.env.TWILIO_ACCOUNT_NUMBER;
  }

  async sendSms(to: string, message: string): Promise<void> {
    try {
      const response = await this.client.messages.create({
        body: message,
        from: this.twilioNumber,
        to,
      });

      this.logger.log(`📨 SMS sent to ${to}: ${response.sid}`);
    } catch (error) {
      this.logger.error('❌ Error sending SMS:', error);
    }
  }
}
