import { RolesEnum } from '../utils/enums';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class ValidateUserDto {
  // Required props
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  pass: string;

  @IsOptional()
  @IsBoolean()
  withJwt: boolean;

  @IsOptional()
  @IsString()
  role?: RolesEnum;
}
