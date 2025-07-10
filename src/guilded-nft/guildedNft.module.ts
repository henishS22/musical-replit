import { Logger, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { GuildedNftController } from './guildedNft.controller';
import { GuildedNftService } from './guildedNft.service';
import { SchemasModule } from '../schemas/schemas.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { NftsModule } from '../nfts/nfts.module';
import { CoinflowModule } from '../coinflow/coinflow.module';

@Module({
  imports: [
    SchemasModule,
    NftsModule,
    ConfigModule.forRoot(),
    HttpModule.register({}),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          uri: configService.get<string>('MONGODB_URI'),
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [GuildedNftController],
  providers: [GuildedNftService],
  exports: [GuildedNftService],
})
export class GuildedNftModule implements OnModuleInit, OnModuleDestroy {
  constructor() {
    return;
  }

  async onModuleInit() {
    return Logger.log('GuildedNft module initialized');
  }

  async onModuleDestroy() {
    return Logger.log('GuildedNft module destroyed');
  }
}
