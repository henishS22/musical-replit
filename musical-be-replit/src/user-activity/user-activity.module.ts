import { Global, Logger, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { SchemasModule } from '../schemas/schemas.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { UserActivityController } from './user-activity.controller';
import { UserActivityService } from './user-activity.service';
import { NotifiesModule } from '../notifies/notifies.module';

@Module({
    imports: [
        SchemasModule,
        NotifiesModule,
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
    controllers: [UserActivityController],
    providers: [UserActivityService],
    exports: [UserActivityService],
})
export class UserActivityModule implements OnModuleInit, OnModuleDestroy {
    constructor() {
        return;
    }

    async onModuleInit() {
        return Logger.log('UserActivity module initialized');
    }

    async onModuleDestroy() {
        return Logger.log('UserActivity module destroyed');
    }
}
