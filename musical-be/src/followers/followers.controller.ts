/**
 *  @file Followers controller file. routes to be used in the module
 *  @author Rafael Marques Siqueira
 *  @exports FollowersController
 */

import {
  Controller,
  Param,
  Post,
  Delete,
  Get,
  UseGuards,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiOperation,
} from '@nestjs/swagger';

// Services Imports
import { FollowersService } from './followers.service';
// Dtos imports

import { DefinedTopics } from './utils/topics.definitions';
import { FollowResponseDto } from './dto/definitions/followResponse.dto';
import { FollowedRoomResponseDto } from './dto/definitions/followedRoomResponse.dto';
import { UserResponseDto } from '../docs/dto/userResponse.dto';

@Controller('follow')
@ApiTags('Followers')
@ApiBearerAuth()
export class FollowersController {
  constructor(private readonly followersService: FollowersService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':id_target')
  @ApiOperation({ summary: 'Follow a new user' })
  @ApiOkResponse({
    description: 'Return the follower and followed',
    type: FollowResponseDto,
  })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @ApiNotFoundResponse({ description: 'Not found.' })
  follow(
    @Param('owner') owner: string,
    @Param('id_target') id_target: string,
  ): Observable<any[]> {
    //Check if both ids are unique to throw an error
    if (owner == id_target) {
      //Throws the error
      throw 'Users id are equal';
    }

    return this.followersService.sendMessage(DefinedTopics.follow.topic, {
      follower: owner,
      followed: id_target,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id_target')
  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiOkResponse({
    description: 'Return the follower and the unfollowed',
    type: FollowResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Bad request.' })
  unfollow(
    @Param('owner') owner: string,
    @Param('id_target') id_target: string,
  ): Observable<any[]> {
    return this.followersService.sendMessage(DefinedTopics.unfollow.topic, {
      follower: owner,
      followed: id_target,
    });
  }

  @Get(':id/followings')
  @ApiOperation({ summary: 'Get all followings from the user ID' })
  @ApiOkResponse({
    description: 'Return all users that the main user follow',
    type: [UserResponseDto],
  })
  @ApiNotFoundResponse({ description: 'User not found.' })
  findAllFollowings(@Param('id') id: string): Observable<any[]> {
    return this.followersService.sendMessage(DefinedTopics.followings.topic, {
      user: id,
    });
  }

  @Get(':id/followers')
  @ApiOperation({ summary: 'Get all followers from the user ID' })
  @ApiOkResponse({
    description: 'Return the follower and followed',
    type: [UserResponseDto],
  })
  @ApiNotFoundResponse({ description: 'User not found.' })
  findAllFollowers(@Param('id') id: string): Observable<any[]> {
    return this.followersService.sendMessage(DefinedTopics.followers.topic, {
      user: id,
    });
  }

  @Get(':id/rooms')
  @ApiOperation({ summary: 'Get all rooms from the user ID' })
  @ApiOkResponse({
    description: 'Return rooms followed by user',
    type: FollowedRoomResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found.' })
  getFollowersRoom(@Param('id') id: string): Observable<any[]> {
    return this.followersService.sendMessage(DefinedTopics.rooms.topic, {
      user: id,
    });
  }
}
