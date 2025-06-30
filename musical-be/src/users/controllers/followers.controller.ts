/**
 *  @file App main controller file. Defines the messages and events to wait for
 *  @author Rafael Marques Siqueira
 *  @exports AppController
 */

import { Controller } from '@nestjs/common';
import { MessagePattern, EventPattern } from '@nestjs/microservices';
import { FollowersService } from '../services/followers.service';

@Controller()
export class FollowersController {
  constructor(private readonly appService: FollowersService) {}

  @MessagePattern('followers.follow')
  async follow(payload: any) {
    return this.appService.follow(payload?.value);
  }

  @MessagePattern('followers.unfollow')
  async unfollow(payload: any) {
    return this.appService.unfollow(payload?.value);
  }

  @MessagePattern('followers.followings')
  async followings(payload: any) {
    return this.appService.followings(payload?.value);
  }

  @MessagePattern('followers.followers')
  async followers(payload: any) {
    return this.appService.followers(payload?.value);
  }

  @MessagePattern('followers.rooms')
  async getFollowersRooms(payload: any) {
    return this.appService.getFollowersRooms(payload?.value);
  }

  @EventPattern('users.delete.account')
  async deleteUserFromFollows(payload: { value: { userId: string } }) {
    return this.appService.deleteUserFromFollows(payload.value.userId);
  }
}
