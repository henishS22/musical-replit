// import { Inject, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { FeedsController } from './feeds.controller';
// import { FeedsService } from './feeds.service';
// import { Transport, ClientsModule, ClientKafka } from '@nestjs/microservices';
// import { getAllTopicsArray } from './utils/topics.definitions';

// // Create the instance for the config service
// const configService = new ConfigService();

// @Module({
//   imports: [
//     ClientsModule.register([
//       {
//         name: 'API_FEEDS',
//         transport: Transport.KAFKA,
//         options: {
//           client: {
//             clientId: 'api-feeds-1',
//             brokers: [configService.get<string>('KAFKA_URL')],
//             authenticationTimeout: 10000,
//             ssl: configService.get<string>('APP_ENV') !== 'development' && {
//               rejectUnauthorized: false,
//               ca: [
//                 `-----BEGIN CERTIFICATE-----${configService.get<string>(
//                   'CA_PEM',
//                 )}-----END CERTIFICATE-----`,
//               ],
//             },

//             sasl: configService.get<string>('APP_ENV') !== 'development' && {
//               mechanism: 'plain',
//               username: configService.get<string>('KAFKA_API_KEY'),
//               password: configService.get<string>('KAFKA_API_SECRET'),
//             },
//           },
//           consumer: {
//             groupId: 'api-feeds-consumer',
//             allowAutoTopicCreation: true,
//             sessionTimeout: 10000,
//             heartbeatInterval: 3333,
//             rebalanceTimeout: 30000,
//           },
//           producer: {
//             allowAutoTopicCreation: true,
//             transactionTimeout: 300000,
//           },
//         },
//       },
//     ]),
//   ],
//   controllers: [FeedsController],
//   providers: [FeedsService],
// })
// export class FeedsModule implements OnModuleInit, OnModuleDestroy {
//   //Define the microservice to connect
//   constructor(@Inject('API_FEEDS') private readonly clientKafka: ClientKafka) {}

//   /**
//    * Defines the on moudule init function to subscribe to reply topics
//    * @function
//    */
//   async onModuleInit() {
//     //Get the array with all messagens defined in the controller, called with service.sendMessage
//     getAllTopicsArray().forEach((key) =>
//       this.clientKafka.subscribeToResponseOf(`${key}`),
//     );
//     await this.clientKafka.connect();
//   }

//   /**
//    * Defines the on moudule destroy function to close connection
//    * @function
//    */
//   async onModuleDestroy() {
//     await this.clientKafka.close();
//   }
// }

import {
  Inject,
  Logger,
  Module,
  OnModuleDestroy,
  OnModuleInit,
  Provider,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GeneralExceptionFilter } from './helper/filters/generalException.filter';
import { MongooseModule } from '@nestjs/mongoose';
import {
  City,
  CitySchema,
  Collaboration,
  CollaborationSchema,
  Country,
  CountrySchema,
  Invite,
  InviteSchema,
  Project,
  ProjectSchema,
  Release,
  ReleaseSchema,
  SkillLevelSchema,
  SkillTypeSchema,
  State,
  StateSchema,
  Style,
  StyleSchema,
  Track,
  TrackSchema,
  User,
  UserSchema,
} from '../schemas/schemas';
import { FeedsController } from './feeds.controller';
import { FeedsService } from './feeds.service';
import { GetStreamService } from './helper/services/getStream.service';
import { connect, StreamClient } from 'getstream';

// Create the instance for the config service
const configService = new ConfigService();

const GetStreamProvider: Provider<StreamClient> = {
  provide: 'GETSTREAM_CLIENT',
  useFactory: (configService: ConfigService) => {
    const apiKey = configService.get<string>('PUBLIC_KEY_GETSTREAM');
    const secretKey = configService.get<string>('PRIVATE_KEY_GETSTREAM');

    return connect(apiKey, secretKey);
  },
  inject: [ConfigService],
};
@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Style.name, schema: StyleSchema },
      { name: Country.name, schema: CountrySchema },
      { name: State.name, schema: StateSchema },
      { name: City.name, schema: CitySchema },
      { name: Collaboration.name, schema: CollaborationSchema },
      { name: Invite.name, schema: InviteSchema },
      { name: 'skill_type', schema: SkillTypeSchema },
      { name: 'skill_level', schema: SkillLevelSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Track.name, schema: TrackSchema },
      { name: Release.name, schema: ReleaseSchema },
    ]),
  ],
  controllers: [FeedsController],
  providers: [
    FeedsService,
    GeneralExceptionFilter,
    GetStreamService,
    GetStreamProvider,
  ],
})
export class FeedsModule implements OnModuleInit, OnModuleDestroy {
  constructor() {}

  /**
   * @function
   */
  async onModuleInit() {
    await Logger.log('Feed module Init');
  }

  /**
   * @function
   */
  async onModuleDestroy() {
    await Logger.log('Feed module Destroy');
  }
}
