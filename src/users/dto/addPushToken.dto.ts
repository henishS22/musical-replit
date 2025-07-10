import { IsNotEmpty, IsString } from 'class-validator';

export class AddPushTokenDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  token: string;
}
