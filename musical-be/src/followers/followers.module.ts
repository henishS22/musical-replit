/**
 *  @file Followers Module file.
 *  @author Rafael Marques Siqueira
 *  @exports FollowersModule
 */

import { Inject, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FollowersController } from './followers.controller';
import { FollowersService } from './followers.service';
import { Transport, ClientsModule, ClientKafka } from '@nestjs/microservices';

import { getAllTopicsArray } from './utils/topics.definitions';

// Create the instance for the config service
const configService = new ConfigService();

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'API_USER_FOLLOWERS',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'api-user-followers-1',
            brokers: [configService.get<string>('KAFKA_URL')],
            authenticationTimeout: 10000,
            ssl: configService.get<string>('APP_ENV') !== 'development' && {
              rejectUnauthorized: false,
              ca: [
                `-----BEGIN CERTIFICATE-----${configService.get<string>(
                  'CA_PEM',
                )}-----END CERTIFICATE-----`,
              ],
            },
            sasl: configService.get<string>('APP_ENV') !== 'development' && {
              mechanism: 'plain',
              username: configService.get<string>('KAFKA_API_KEY'),
              password: configService.get<string>('KAFKA_API_SECRET'),
            },
          },
          consumer: {
            groupId: 'api-user-followers-consumer',
            allowAutoTopicCreation: true,
            sessionTimeout: 300000,
            heartbeatInterval: 220000,
            rebalanceTimeout: 30000,
          },
          producer: {
            allowAutoTopicCreation: true,
            transactionTimeout: 300000,
          },
        },
      },
    ]),
  ],
  controllers: [FollowersController],
  providers: [FollowersService],
})
export class FollowersModule implements OnModuleInit, OnModuleDestroy {
  //Define the microservice to connect
  constructor(
    @Inject('API_USER_FOLLOWERS')
    private readonly clientKafka: ClientKafka,
  ) {}

  /**
   * Defines the on moudule init function to subscribe to reply topics
   * @function
   */
  async onModuleInit() {
    //Get the array with all messagens defined in the controller, called with service.sendMessage
    getAllTopicsArray().forEach((key) =>
      this.clientKafka.subscribeToResponseOf(`${key}`),
    );
    await this.clientKafka.connect();
  }

  /**
   * Defines the on moudule destroy function to close connection
   * @function
   */
  async onModuleDestroy() {
    await this.clientKafka.close();
  }
}
