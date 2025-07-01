import { IsNotEmpty, IsString } from 'class-validator';

export class CommentedOnProjectDto {
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
  comment: string;
}
