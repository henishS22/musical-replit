import { IsNotEmpty, IsString } from 'class-validator';

export class RemovePushTokenDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  token: string;
}
