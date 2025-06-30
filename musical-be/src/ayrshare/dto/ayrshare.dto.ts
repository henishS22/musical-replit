import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import {
  AyrshareHashtagPosition,
  AyrshareSocialNetworks,
  WebhookAction,
} from '../utils/enums';

export class CreateProfileDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UnlinkSocialNetworkDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(AyrshareSocialNetworks)
  platform: AyrshareSocialNetworks;
}

export class AutoHashtagsDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  // Optional parameters
  @IsOptional()
  @IsString()
  @IsEnum(AyrshareHashtagPosition)
  position: AyrshareHashtagPosition;

  @IsOptional()
  @IsString()
  language: string;
}
