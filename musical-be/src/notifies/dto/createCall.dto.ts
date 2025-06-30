import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCallDto {
  @IsNotEmpty()
  @IsString()
  user_target: string;

  @IsNotEmpty()
  @IsString()
  room_name: string;

  @IsNotEmpty()
  @IsString()
  room_url: string;
}
