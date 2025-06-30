/**
 *  @file App main module file.
 *  @author Rafael Marques Siqueira
 *  @exports AppModule
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { SkillsModule } from './skills/skills.module';
// import { FollowersModule } from './followers/followers.module';
import { TracksModule } from './tracks/tracks.module';
import { ProjectsModule } from './projects/projects.module';
import { ChatModule } from './chat/chat.module';
import { NftsModule } from './nfts/nfts.module';
import { RegisterModule } from './register/register.module';
import { CoinflowModule } from './coinflow/coinflow.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { NotifiesModule } from './notifies/notifies.module';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { ErrorsInterceptor } from './interceptors/errors.interceptor';
import { ReportsModule } from './reports/reports.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { SongContestModule } from './song-contest/song-contest.module';
import { FeedsModule } from './feeds/feeds.module';
import { IpfsPinataModule } from './ipfs-pinata-uploads/ipfs-pinata.module';
import { HttpModule } from '@nestjs/axios';
import { AyrshareModule } from './ayrshare/ayrshare.module';
import { KazmModule } from './kazm/kazm.module';
import { AuthModule } from './auth/auth.module';
import { CommunityForumModule } from './community-forum/community-forum.module';
import { StreamModule } from './stream/stream.module';
import { DistroModule } from './distro/distro.module';
import { MetadataModule } from './metadata/metadata.module';
import { GamificationEventModule } from './gamificationEvent/gamificationEvent.module';
import { UserActivityModule } from './user-activity/user-activity.module';
import { ChartmetricModule } from './chartmetric/chartmetric.module';
import { QuestModule } from './quest/quest.module';
import { ScrapperModule } from './scrapper/scrapper.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UsersModule,
    ProjectsModule,
    NotifiesModule,
    FeedsModule,
    ReportsModule,
    RegisterModule,
    CoinflowModule,
    TracksModule,
    SkillsModule,
    // FollowersModule,
    NftsModule,
    ChatModule,
    AyrshareModule,
    KazmModule,
    DistroModule,
    UserActivityModule,
    MetadataModule,
    GamificationEventModule,
    QuestModule,
    ScrapperModule,
    RedisModule.forRoot({
      closeClient: true,
      config: {
        host: process.env.REDIS_URL ? process.env.REDIS_URL : '127.0.0.1',
        port: 6379,
        password: process.env.REDIS_URL ? null : 'XVQQjygXG4YYr',
        // namespace: 'reports',
      },
    }),

    // Import sentry module
    SentryModule.forRoot({
      dsn: process.env.SENTRY_DNS,
      debug: process.env.SENTRY_DEBUG === 'true',
      environment: process.env.SENTRY_ENV,
      release: process.env.SENTRY_RELEASE,
    }),

    // Static assets
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'docs', 'static'),
    }),
    IpfsPinataModule,
    SongContestModule,
    HttpModule.register({}),
    KazmModule,
    AuthModule,
    ChartmetricModule,
    CommunityForumModule,
    StreamModule],
  providers: [ErrorsInterceptor],
})
export class AppModule { }
