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
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  business: string;

  @IsOptional()
  @IsUrl()
  company: string;

  @IsOptional()
  @IsString()
  comments: string;

  @IsOptional()
  @IsString()
  instagram?: string;

  @IsOptional()
  @IsString()
  youtube?: string;

  @IsOptional()
  @IsString()
  spotify?: string;

  @IsOptional()
  @IsString()
  tiktok?: string;

  @IsOptional()
  @IsString()
  genreOfMusic?: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(HubspotOriginForm)
  originForm: HubspotOriginForm;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  topic?: string;
}
