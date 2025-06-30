import { Logger, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { SchemasModule } from '../schemas/schemas.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { ScrapperController } from './scrapper.controller';
import { ScrapperService } from './scrapper.service';
import { QuestModule } from '../quest/quest.module';

@Module({
    imports: [
        SchemasModule,
        QuestModule,
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
    controllers: [ScrapperController],
    providers: [ScrapperService],
})
export class ScrapperModule implements OnModuleInit, OnModuleDestroy {
    constructor() {
        return;
    }

    async onModuleInit() {
        return Logger.log('Scrapper module initialized');
    }

    async onModuleDestroy() {
        return Logger.log('Scrapper module destroyed');
    }
}
