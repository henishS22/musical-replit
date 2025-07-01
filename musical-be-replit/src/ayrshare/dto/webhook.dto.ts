import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsUrl,
} from 'class-validator';
import { WebhookAction } from '../utils/enums';

export class WebhookDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(WebhookAction)
  action: string;

  @IsNotEmpty()
  @IsString()
  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  secret?: string;
}

export class UnregisterWebhookDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(WebhookAction)
  action: string;
}
