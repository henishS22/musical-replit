import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class SendMessageDto {
  @IsNotEmpty()
  @IsString()
  recipientId: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true, message: 'Each media URL must be a valid URL' })
  mediaUrls?: string[];
}
