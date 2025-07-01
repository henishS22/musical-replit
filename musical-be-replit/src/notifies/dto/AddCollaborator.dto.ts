import { IsNotEmpty, IsString } from 'class-validator';

export class AddCollaboratorDto {
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
  collaboratorName: string;
}
