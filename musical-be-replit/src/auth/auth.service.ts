import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { User } from '@/src/schemas/schemas';
import { Model } from 'mongoose';
import { URLSearchParams } from 'url';
import axios from 'axios';
import * as querystring from 'querystring';
import { ObjectId } from 'mongodb';
import { AyrshareService } from '@/src/ayrshare/ayrshare.service';
import { UsersService } from '../users/users.service';
import { UserActivityService } from '../user-activity/user-activity.service';
import { EventTypeEnum } from '../gamificationEvent/utils/enum';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly ayrshareService: AyrshareService,
    private readonly usersService: UsersService,
    private readonly userActivityService: UserActivityService

  ) { }

  async googleAuthURL(options: { platform?: 'ios' | 'android' | 'web' }) {
    //redirect_uri
    let redirect_uri =
      options.platform === 'ios'
        ? process.env.GOOGLE_IOS_REDIRECT_URI
        : options.platform === 'android'
          ? process.env.GOOGLE_ANDROID_REDIRECT_URI
          : process.env.GOOGLE_WEB_REDIRECT_URI;

    // client Id.
    let clientId =
      options.platform === 'ios'
        ? process.env.GOOGLE_IOS_CLIENT_ID
        : options.platform === 'android'
          ? process.env.GOOGLE_ANDROID_CLIENT_ID
          : process.env.GOOGLE_WEB_CLIENT_ID;

    const object = {
      client_id: clientId,
      redirect_uri: redirect_uri,
      response_type: 'code',
      scope: ['openid', 'email', 'profile'].join(' '),
      access_type: 'offline',
      prompt: 'consent',
    };

    const googleAuthURL = `${process.env.GOOGLE_OAUTH_URL
      }?${new URLSearchParams(object).toString()}`;

    return {
      message: 'Generated Google auth link',
      item: { googleAuthURL },
    };
  }

  async googleCallback(params) {
    try {
      const { code, platform } = params;
      let access_token = null

      if (platform === 'ios' || platform === 'android') {
        access_token = code
      } else {

        const tokenResponse = await axios.post(process.env.GOOGLE_TOKEN_URL,
          {
            code,
            client_id: process.env.GOOGLE_WEB_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_WEB_REDIRECT_URI,
            grant_type: 'authorization_code',
          },
          {
            headers: { 'Content-Type': 'application/json' },
          },
        );

        if (!tokenResponse?.data) {
          throw new Error('Failed to fetch data from Google auth link.');
        }

        access_token = tokenResponse.data.access_token
      }

      const userInfoResponse = await axios.get(
        process.env.GOOGLE_USER_INFO_URL,
        {
          headers: { Authorization: `Bearer ${access_token}` },
        },
      );


      let userData = userInfoResponse.data;

      let existingUser = await this.userModel.findOne({
        email: userData?.email.trim().toLowerCase(),
      });

      if (existingUser) {
        existingUser.firstTimeLogin = false;
        await existingUser.save();
      }

      if (existingUser && existingUser.isBanned) {
        throw new UnauthorizedException('The user has been banned by the admin. Please contact the admin for further assistance.');
      }

      if (!existingUser) {
        let createUser = {
          name: userData?.name,
          email: userData?.email,
          username: userData?.name,
          profile_img: userData?.picture,
          roles: ['USER'],
          firstTimeLogin: true,
        };

        existingUser = await this.userModel.create(createUser);

        try {
          // Assign Free Subscription to new user
          await this.usersService.assignFreeSubscription(existingUser._id.toString());

          // Create users storage doc
          await this.usersService.createUserStorageRecord(existingUser._id.toString())

          // // Create Ayrshare profile
          // await this.ayrshareService.createProfile(
          //   { title: existingUser?.username || existingUser?.name },
          //   existingUser._id.toString(),
          // );

          //gamification token assign
          await this.userActivityService.activity(existingUser._id.toString(), EventTypeEnum.SIGNUP_EMAIL)

        } catch (error) {
          console.log(error?.response?.data, '=ayrRes error=');
        }
      }

      const payload = {
        sub: new ObjectId(existingUser._id),
        email: existingUser.email,
        name: existingUser.name,
      };

      const accessToken = this.jwtService.sign(payload);

      return {
        message: 'Signin successfully.',
        items: { userId: new ObjectId(existingUser._id), accessToken },
      };
    } catch (error) {
      throw new Error(error.message || 'Authentication failed');
    }
  }
}
