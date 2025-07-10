import { IsNotEmpty, IsString } from 'class-validator';

export class AddTrackProjectDto {
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @IsNotEmpty()
  @IsString()
  fromUserId: string;

  @IsNotEmpty()
  @IsString()
  toUserId: string;

  @IsString()
  trackIds: string[];
}
