import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
  IsInt,
  Min,
  Max,
  ValidateNested,
  IsArray
} from 'class-validator';
import { DeviceDto } from './device.dto';

//Based on
//https://docs.nestjs.com/techniques/validation

export class CreateUserDto {
  // Required props
  @IsOptional()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  invitationCode?: string;

  @IsInt()
  @Min(0)
  @Max(2)
  genre: number;

  // Optional props
  @IsOptional()
  @IsString()
  profile_type: 0 | 1;

  @IsOptional()
  @IsDateString()
  birthday?: string;

  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @IsOptional()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  tag: string;

  @IsOptional()
  @IsString()
  descr: string;

  @IsOptional()
  @IsArray()
  clb_interest: string[];

  @IsOptional()
  @IsArray()
  clb_setup: string[];

  @IsOptional()
  @IsString()
  profile_img: string;

  @IsOptional()
  @IsString()
  cover_img: string;

  @IsOptional()
  @IsString()
  wallet: string;

  @IsOptional()
  @IsString()
  spotify: string;

  @IsOptional()
  @IsString()
  apple_music: string;

  @IsOptional()
  @IsString()
  youtube: string;

  @IsOptional()
  @IsString()
  instagram: string;

  @IsOptional()
  @IsString()
  tiktok: string;

  @IsOptional()
  @IsString()
  twitter: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DeviceDto)
  registerDevice?: DeviceDto;

  @IsOptional()
  @IsBoolean()
  isMobile: boolean;
}
