import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveCollaboratorDto {
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @IsNotEmpty()
  @IsString()
  toUserId: string;

  @IsNotEmpty()
  @IsString()
  fromUserId: string;

  @IsNotEmpty()
  @IsString()
  collaboratorName: string;
}
