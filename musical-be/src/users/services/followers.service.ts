/**
 *  @file App main service file. Defines the services to be used in the microservice.
 *  @author Rafael Marques Siqueira
 *  @exports AppService
 */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { FindFollow } from '../dto/followers/findFollow.dto';
// Dtos imports
import { UnFollowUserDto } from '../dto/followers/unFollowUser.dto';
// Schemas import
import {
  User,
  UserDocument,
  UserFollow,
  UserFollowDocument,
} from '@/src/schemas/schemas';
// import { FeedsService } from '../services/feeds.service';
import { NotifiesService } from '@/src/notifies/notifies.service';

@Injectable()
export class FollowersService {
  // Schemas injection
  constructor(
    @InjectModel('users_follow')
    private userFollowModel: Model<UserFollowDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly notificationsService: NotifiesService, // private readonly feedsService: FeedsService,
  ) {}

  /**
   * Follow a new user
   * @function
   * @param {UnFollowUserDto} followUserDto - Follow and followed informations
   */
  async follow(followUserDto: UnFollowUserDto): Promise<UserFollow> {
    const follower = new ObjectId(followUserDto.follower);
    const followed = new ObjectId(followUserDto.followed);
    const createdFollow = new this.userFollowModel({
      follower,
      followed,
    });

    this.notificationsService.addUserFollowedYou({
      fromUserId: follower?.toString(),
      toUserId: followed?.toString(),
    });
    // this.feedsService.followUserFeed(
    //   followUserDto.follower,
    //   followUserDto.followed,
    // );

    return createdFollow.save();
  }

  /**
   * Unfollow a new user
   * @function
   * @param {UnFollowUserDto} unFollowUserDto - Follow and followed informations
   */
  async unfollow(unFollowUserDto: UnFollowUserDto): Promise<any> {
    // this.feedsService.unfollowUserFeed(
    //   unFollowUserDto.follower,
    //   unFollowUserDto.followed,
    // );

    return this.userFollowModel
      .deleteOne({
        follower: new ObjectId(unFollowUserDto.follower),
        followed: new ObjectId(unFollowUserDto.followed),
      })
      .exec();
  }

  /**
   * Get all followings users from main user
   * @function
   * @param {FindFollow} findFollow - User id
   */
  async followings(findFollow: FindFollow): Promise<UserFollow[]> {
    //Find following users
    const followingsSearch = await this.userFollowModel
      .find(
        { follower: new ObjectId(findFollow.user) },
        { _id: 0, followed: 1 },
      )
      .sort({ createdAt: -1 });

    //Build user ids array and result object
    const resultObj = {};
    const usersIds = [];

    for (const following of followingsSearch) {
      usersIds.push(following.followed);

      resultObj[following.followed.toString()] = {
        id: following.followed,
      };
    }

    //Find users profile images
    const usersData = await this.userModel.find(
      {
        _id: {
          $in: usersIds,
        },
      },
      { _id: 1, profile_img: 1, name: 1 },
    );
    //Build the final result
    for (const user of usersData) {
      const myUserObj = resultObj[user._id.toString()];

      if (myUserObj) {
        myUserObj.img = user.profile_img;
        myUserObj.name = user.name;
      }
    }

    return Object.values(resultObj);
  }

  /**
   * Get all followers users from main user
   * @function
   * @param {FindFollow} findFollow - User id
   */
  async followers(findFollow: FindFollow): Promise<UserFollow[]> {
    //Find following users
    const followingsSearch = await this.userFollowModel
      .find(
        { followed: new ObjectId(findFollow.user) },
        { _id: 0, follower: 1 },
      )
      .sort({ createdAt: -1 });

    //Build user ids array and result object
    const resultObj = {};
    const usersIds = [];

    for (const following of followingsSearch) {
      usersIds.push(following.follower);

      resultObj[following.follower.toString()] = {
        id: following.follower,
      };
    }

    //Find users profile images
    const usersData = await this.userModel.find(
      {
        _id: {
          $in: usersIds,
        },
      },
      { _id: 1, profile_img: 1, name: 1 },
    );

    //Build the final result
    for (const user of usersData) {
      const myUserObj = resultObj[user._id.toString()];

      if (myUserObj) {
        myUserObj.img = user.profile_img;
        myUserObj.name = user.name;
      }
    }

    return Object.values(resultObj);
  }

  /**
   * Get all followings rooms
   * @function
   * @param {FindFollow} findFollow - User id
   */
  async getFollowersRooms(findFollow: FindFollow) {
    //Find following users
    const rooms = await this.userFollowModel
      .aggregate([
        {
          $match: {
            follower: new ObjectId(findFollow.user),
          },
        },
        {
          $lookup: {
            from: 'rooms',
            as: 'rooms',
            let: { user: '$followed' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$$user', '$user_id'] },
                  exp: {
                    $gte: Date.now() / 1000,
                  },
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'followed',
            foreignField: '_id',
            as: 'user',
          },
        },
      ])
      .sort({ createdAt: -1 });

    return rooms.map((obj: any) => ({
      id: obj.user[0].followed,
      _id: obj.user[0]._id,
      name: obj.user[0].name,
      profile_img: obj.user[0].profile_img,
      gender: obj.user[0].gender,
      rooms: obj.rooms,
    }));
  }

  /**
   * Delete user from all followers or followings
   *
   * @function
   * @param {string} userId User id
   */
  async deleteUserFromFollows(userId: string) {
    const id = new ObjectId(userId);
    await this.userFollowModel.deleteMany({
      $or: [{ followed: id }, { follower: id }],
    });
  }
}
