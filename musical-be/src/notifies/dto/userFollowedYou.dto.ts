import { IsNotEmpty, IsString } from 'class-validator';

export class UserFollowedYouDto {
  @IsNotEmpty()
  @IsString()
  fromUserId: string;

  @IsNotEmpty()
  @IsString()
  toUserId: string;
}
