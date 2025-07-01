import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as admin from 'firebase-admin';
import { User, UserDocument, Notify } from '@/src/schemas/schemas';
import { NotificationFormatterService } from './notificationFormatter.service';

interface FirebaseServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
}

const serviceAccount: FirebaseServiceAccount = {
  "type": process.env.FIREBASE_TYPE,
  "project_id": process.env.FIREBASE_PROJECT_ID,
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
  "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CLIENT_ID,
  "auth_uri": process.env.FIREBASE_AUTH_URI,
  "token_uri": process.env.FIREBASE_TOKEN_URI,
  "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL,
  "universe_domain": process.env.FIREBASE_UNIVERSE_DOMAIN,
};

@Injectable()
export class PushNotificationsService {
  constructor(
    private readonly notificationFormatterService: NotificationFormatterService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    this.initializeFirebase();
  }

  private initializeFirebase(): void {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as any),
      });
    }
  }

  async sendPushNotification(notification: Notify): Promise<void> {
    const target = await this.getTargetFromNotification(notification);
    if (!target?.pushTokens?.length) return;
    const pushTokens = target.pushTokens.map(({ token }) => token);
    await this.sendPushNotificationToUser(pushTokens, notification);
  }
  private async sendPushNotificationToUser(
    pushTokens: string[],
    notification: Notify,
  ): Promise<void> {
    const notificationFormatted = await this.notificationFormatterService.format(notification);
    if (!notificationFormatted) return;

    const messages = pushTokens.map((token) => ({
      token,
      notification: {
        title: notificationFormatted.title,
        body: notificationFormatted.body,
      },
      data: {
        type: notification.type,
        info: JSON.stringify(notification),
      },
    }));

    try {
      const responses = await Promise.allSettled(messages.map((msg) => admin.messaging().send(msg)));
      responses.forEach((response, index) => {
        if (response.status === 'rejected') {
          console.error(`Failed to send notification to token ${pushTokens[index]}: ${response.reason.message}`);
        }
      });
    } catch (e) {
      console.error('Unexpected error in sending push notifications:', e);
    }
  }

  private async getTargetFromNotification(notification: Notify): Promise<UserDocument> {
    return this.userModel.findOne({ _id: notification.to }).select({ name: 1, pushTokens: 1 });
  }
}


// import { Inject, Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Expo, ExpoPushMessage, ExpoPushToken } from 'expo-server-sdk';
// import { Model } from 'mongoose';
// import ServiceException from '../exceptions/ServiceException';
// import { User, UserDocument, Notify } from '@/src/schemas/schemas';
// import { ExceptionsEnum } from '../utils/enums';
// import { NotificationFormatterService } from './notificationFormatter.service';

// @Injectable()
// export class PushNotificationsService {
//   constructor(
//     private readonly notificationFormatterService: NotificationFormatterService,
//     @InjectModel(User.name) private userModel: Model<UserDocument>,
//     @Inject('EXPO') private readonly expoClient: Expo,
//   ) { }

//   /**
//    * Sends a push notification to a user.
//    *
//    * @param {Notify} notification
//    * @returns {Promise<void>}
//    */
//   async sendPushNotification(notification: Notify): Promise<void> {
//     const target = await this.getTargetFromNotification(notification);
//     const hasPushTokens = !!target.pushTokens?.length;

//     if (!target || !hasPushTokens) {
//       return;
//     }

//     const pushTokens = target.pushTokens.map(({ token }) => token);

//     await this.sendPushNotificationToUser(pushTokens, notification);
//   }

//   /**
//    * Sends a push notification to all devices from a user.
//    *
//    * @param {ExpoPushToken} pushTokens
//    * @param {Notify} notification
//    * @returns {Promise<void>}
//    */
//   private async sendPushNotificationToUser(
//     pushTokens: ExpoPushToken[],
//     notification: Notify,
//   ): Promise<void> {
//     const notificationFormatted =
//       await this.notificationFormatterService.format(notification);

//     if (!notificationFormatted) {
//       return;
//     }

//     const messages: ExpoPushMessage[] = pushTokens.map((pushToken) => ({
//       to: pushToken,
//       sound: 'default',
//       body: notificationFormatted.body,
//       title: notificationFormatted.title,
//       data: {
//         type: notification.type,
//         info: notification,
//       },
//     }));

//     try {
//       await this.expoClient.sendPushNotificationsAsync(messages);
//     } catch (e) {
//       throw new ServiceException(
//         `Failed to send push notification: ${e.message}`,
//         ExceptionsEnum.InternalServerError,
//       );
//     }
//   }

//   /**
//    * Find the user that should receive the notification.
//    *
//    * @param {Notify} notification
//    * @returns {Promise<UserDocument>}
//    */
//   private async getTargetFromNotification(
//     notification: Notify,
//   ): Promise<UserDocument> {
//     return this.userModel
//       .findOne({
//         _id: notification.to,
//       })
//       .select({
//         name: 1,
//         pushTokens: 1,
//       });
//   }
// }
