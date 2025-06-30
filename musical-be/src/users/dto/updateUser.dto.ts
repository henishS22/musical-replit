import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsArray,
  IsBoolean,
} from 'class-validator';

//Based on
//https://docs.nestjs.com/techniques/validation

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  descr: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2)
  genre: number;

  @IsOptional()
  @IsString()
  tag: string;

  @IsOptional()
  @IsArray()
  clb_interest: string[];

  @IsOptional()
  @IsString()
  clb_availability: string;

  @IsOptional()
  @IsArray()
  clb_setup: string[];

  @IsOptional()
  @IsString()
  profile_type: 0 | 1;

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
  city: string;

  @IsOptional()
  @IsArray()
  skills: {
    type:string,
    level:string
  }[];

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
  @IsString()
  oldPassword: string;

  @IsOptional()
  @IsString()
  newPassword: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsOptional()
  @IsArray()
  styles: string[];

  @IsOptional()
  @IsArray()
  preferredStyles: string[];

  @IsOptional()
  @IsBoolean()
  emailVerified: boolean;
}
