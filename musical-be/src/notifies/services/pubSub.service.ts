import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PubSub } from '@google-cloud/pubsub';
import { TemplateService } from './template.services';
import { SmsService } from './sms.service';
import * as he from 'he';
import * as striptags from 'striptags';
import * as cheerio from 'cheerio';
import { UsersService } from '@/src/users/users.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@/src/schemas/schemas/user.schema';
@Injectable()
export class PubSubService implements OnModuleInit {
  private readonly logger = new Logger(PubSubService.name);
  private pubSubClient: PubSub;
  private topicName = process.env.PUBSUB_TOPIC_NAME;
  private subscriptionName = process.env.PUBSUB_SUBSCRIPTION_NAME

  constructor(
    private readonly templateService: TemplateService,
    private readonly smsService: SmsService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {
    this.pubSubClient = new PubSub({
      projectId: process.env.PUBSUB_PROJECT_ID,
      keyFilename: './gcs.json',
    });
  }

  // Publish an invite message
  async publishInviteMessage(
    owner: string,
    body: { countryCode: string, phoneNumber: string },
  ): Promise<void> {

    let phoneNumber = `${body.countryCode}${body.phoneNumber}`

    const user = await this.userModel.findOne({ _id: owner });

    let templateId = 'invite_user_by_sms';
    let params = {
      name: user.name,
      appIos: process.env.APP_ANDROID_URL,
      appAndroid: process.env.APP_IOS_URL,
    };

    const dataBuffer = Buffer.from(
      JSON.stringify({ phoneNumber, templateId, params }),
    );

    try {
      await this.pubSubClient
        .topic(this.topicName)
        .publishMessage({ data: dataBuffer });
      this.logger.log(`📨 Message published to topic: ${this.topicName}`);
    } catch (error) {
      this.logger.error('❌ Error publishing message:', error);
    }
  }

  // Listen for messages and process them
  async listenForMessages() {
    const subscription = this.pubSubClient.subscription(this.subscriptionName);

    subscription.on('message', async (message) => {
      try {
        const data = JSON.parse(message.data.toString());
        this.logger.log(`✅ Received message: ${JSON.stringify(data)}`);

        // Generate the message using the Handlebars template
        let finalMessage = await this.templateService.getTemplate(
          data.templateId,
          data.params,
        );

        // Load HTML into Cheerio
        const $ = cheerio.load(finalMessage);

        // Extract links and replace them with text + URL format
        $('a').each((_, elem) => {
          const linkText = $(elem).text();
          const linkHref = $(elem).attr('href');
          $(elem).replaceWith(`${linkText}: ${linkHref}`);
        });

        // Convert <br> tags into newlines
        finalMessage = $.html().replace(/<br\s*\/?>/gi, '\n');

        // Strip HTML tags to get plain text
        finalMessage = striptags(finalMessage);
        console.log('📜 Final Message (Plain Text):', finalMessage);

        // Send SMS via Twilio
        await this.smsService.sendSms(data.phoneNumber, finalMessage);

        // Acknowledge the message
        message.ack();
        this.logger.log(`✅ Message acknowledged successfully`);
      } catch (error) {
        this.logger.error('❌   Error processing message:', error);
      }
    });

    subscription.on('error', (error) => {
      this.logger.error('❌ Error in Pub/Sub subscription:', error);
    });

    this.logger.log(`🚀 Listening for messages on ${this.subscriptionName}...`);
  }

  // Start listening when the module initializes
  async onModuleInit() {
    this.listenForMessages();
  }
}
