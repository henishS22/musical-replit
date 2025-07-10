import { IsNotEmpty, IsString } from 'class-validator';

export class CreateForumDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  description: string;
}