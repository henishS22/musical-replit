/**
 *  @file Schema DTO (data transfer object) file. Create and exports a DTO to be use for params validations
 *  @author Rafael Marques Siqueira
 *  @exports UnFollowUserDto
 */

import { IsNotEmpty, IsString } from 'class-validator';

export class UnFollowUserDto {
  @IsNotEmpty()
  @IsString()
  follower: string;

  @IsNotEmpty()
  @IsString()
  followed: string;
}
