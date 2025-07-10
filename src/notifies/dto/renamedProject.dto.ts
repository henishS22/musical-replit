import { IsNotEmpty, IsString } from 'class-validator';

export class RenamedProjectDto {
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
  oldProjectName: string;

  @IsNotEmpty()
  @IsString()
  newProjectName: string;
}
