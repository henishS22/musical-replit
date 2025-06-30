import { Global, Logger, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { SchemasModule } from '../schemas/schemas.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { GamificationEventService } from './gamificationEvent.service';
import { GamificationEventController } from './gamificationEvent.controller';

@Module({
    imports: [
        SchemasModule,
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
    controllers: [GamificationEventController],
    providers: [GamificationEventService],
})
export class GamificationEventModule implements OnModuleInit, OnModuleDestroy {
    constructor() {
        return;
    }

    async onModuleInit() {
        return Logger.log('GamificationEvent module initialized');
    }

    async onModuleDestroy() {
        return Logger.log('GamificationEvent module destroyed');
    }
}
