import { IsNotEmpty, IsString } from 'class-validator';

export class RenamedReleaseDto {
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
  @IsString()
  oldReleaseName: string;

  @IsNotEmpty()
  @IsString()
  newReleaseName: string;
}
