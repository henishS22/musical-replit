import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HubspotOriginForm } from '../utils/enums';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class createRegisterDto {
  @ApiProperty({
    description: 'The email',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'The first name',
  })
  @IsOptional()
  @IsString()
  firstName: string;

  @ApiPropertyOptional({
    description: 'The last name',
  })
  @IsOptional()
  @IsString()
  lastName: string;

  @ApiPropertyOptional({
    description: 'The work title',
  })
  @IsOptional()
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'The company name',
  })
  @IsOptional()
  @IsString()
  business: string;

  @ApiPropertyOptional({
    description: 'The company website',
  })
  @IsOptional()
  @IsUrl()
  company: string;

  @ApiPropertyOptional({
    description: 'Extra comments',
  })
  @IsOptional()
  @IsString()
  comments: string;

  @ApiPropertyOptional({
    description: 'Instagram',
  })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiPropertyOptional({
    description: 'YouTube',
  })
  @IsOptional()
  @IsString()
  youtube?: string;

  @ApiPropertyOptional({
    description: 'Spotify',
  })
  @IsOptional()
  @IsString()
  spotify?: string;

  @ApiPropertyOptional({
    description: 'TikTok',
  })
  @IsOptional()
  @IsString()
  tiktok?: string;

  @ApiPropertyOptional({
    description: 'Genre of Music',
  })
  @IsOptional()
  @IsString()
  genreOfMusic?: string;

  @ApiPropertyOptional({
    description: 'Origin form',
    enum: HubspotOriginForm,
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(HubspotOriginForm)
  originForm: HubspotOriginForm;

  @ApiPropertyOptional({
    description: 'A contact message',
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({
    description: 'Topic',
  })
  @IsOptional()
  @IsString()
  topic?: string;
}
