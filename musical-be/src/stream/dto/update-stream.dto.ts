// src/live-stream/dto/create-live-stream.dto.ts
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsDate,IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { LiveStreamType, AccessControl } from './create-stream.dto';

export class UpdateLiveStreamDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(LiveStreamType)
  @Transform(({ value }) => (typeof value === 'string' ? value : value[0]))
  type: LiveStreamType;

  @IsEnum(AccessControl)
  @Transform(({ value }) => (typeof value === 'string' ? value : value[0]))
  accessControl: AccessControl;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  scheduleDate?: Date;

  @IsOptional()
  @IsArray()
  nftIds?: string[];
}
