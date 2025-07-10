import { IsNotEmpty, IsString } from 'class-validator';

export class AddReactedToActivityDto {
  @IsNotEmpty()
  @IsString()
  activityId: string;

  @IsNotEmpty()
  @IsString()
  reactionId: string;

  @IsNotEmpty()
  @IsString()
  reactionType: string;

  @IsNotEmpty()
  @IsString()
  fromUserId: string;

  @IsNotEmpty()
  @IsString()
  toUserId: string;
}
