import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreatePasswordResetDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
