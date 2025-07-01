import { IsNotEmpty, IsString } from 'class-validator';

export class AddCommentDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  comment: string;

  @IsNotEmpty()
  @IsString()
  owner: string;
}
