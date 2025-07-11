import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class RemovedTracksFromFinalVersionDto {
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @IsNotEmpty()
  @IsString()
  fromUserId: string;

  @IsNotEmpty()
  @IsString()
  toUserId: string;

  @IsNotEmpty()
  @IsString()
  releaseId: string;

  @IsNotEmpty()
  @IsArray()
  trackIds: string[];
}
