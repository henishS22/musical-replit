import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  Max,
  Min,
  IsDateString,
  IsNumber,
  IsArray,
  IsBoolean
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

//Based on
//https://docs.nestjs.com/techniques/validation

export class CreateUserInputDto {
  // Required props
  @ApiProperty({
    description: 'The user name',
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The unique username',
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    description: 'The user email',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The user profile type',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  profile_type: 0 | 1;

  @ApiProperty({
    description: 'The user genre',
    required: false,
  })
  @IsInt()
  @Min(0)
  @Max(2)
  genre: number;

  @ApiProperty({
    description: 'The user birth date',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  birthday: string;

  @ApiProperty({
    description: 'The user invitation code',
    required: false,
  })
  @IsOptional()
  @IsString()
  invitationCode: string;

  // Optional props
  @ApiProperty({
    description: 'The user password',
    required: false,
  })
  @IsOptional()
  @IsString()
  password: string;

  @ApiProperty({
    description: 'The user tag ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  tag: string;

  @ApiProperty({
    description: 'The user description',
    required: false,
  })
  @IsOptional()
  @IsString()
  descr: string;

  @ApiProperty({
    description: 'The collaboration interests',
    required: false,
  })

  @IsOptional()
  @IsArray()
  clb_interest: string[];

  @ApiProperty({
    description: 'The collaboration setup',
    required: false,
  })

  @IsOptional()
  @IsArray()
  clb_setup: string[];

  @ApiProperty({
    description: 'The user avatar',
    required: false,
  })
  @IsOptional()
  @IsString()
  profile_img: string;

  @ApiProperty({
    description: 'The user cover',
    required: false,
  })
  @IsOptional()
  @IsString()
  cover_img: string;

  @ApiProperty({
    description: 'The user wallet',
    required: false,
  })
  @IsOptional()
  @IsString()
  wallet: string;

  @ApiProperty({
    description: 'The user Spotify',
    required: false,
  })
  @IsOptional()
  @IsString()
  spotify: string;

  @ApiProperty({
    description: 'The user Apple Music',
    required: false,
  })
  @IsOptional()
  @IsString()
  apple_music: string;

  @ApiProperty({
    description: 'The user YouTube',
    required: false,
  })
  @IsOptional()
  @IsString()
  youtube: string;

  @ApiProperty({
    description: 'The user Instagram',
    required: false,
  })
  @IsOptional()
  @IsString()
  instagram: string;

  @ApiProperty({
    description: 'The user TikTok',
    required: false,
  })
  @IsOptional()
  @IsString()
  tiktok: string;

  @ApiProperty({
    description: 'The user Twitter',
    required: false,
  })
  @IsOptional()
  @IsString()
  twitter: string;

  @IsOptional()
  @IsBoolean()
  isMobile: boolean;
}
