import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleStrategy } from './google.strategy';
import { JwtStrategy } from './jwt.strategy';
import { SchemasModule } from '../schemas/schemas.module';
import { AyrshareController } from '../ayrshare/ayrshare.controller';
import { AyrshareService } from '../ayrshare/ayrshare.service';
import { UsersModule } from '../users/users.module';
import { UsersController } from '../users/users.controller';
import { UserActivityService } from '../user-activity/user-activity.service';

@Module({
  imports: [
    SchemasModule,
    UsersModule,
    ConfigModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'google' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: process.env.SECRET_KEY,
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController, AyrshareController, UsersController],
  providers: [
    AuthService,
    GoogleStrategy,
    JwtStrategy,
    ConfigService,
    AyrshareService,
    UserActivityService
  ],
  exports: []
})
export class AuthModule { }
