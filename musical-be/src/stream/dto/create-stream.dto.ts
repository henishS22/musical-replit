// src/live-stream/dto/create-live-stream.dto.ts
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsDate,IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export enum LiveStreamType {
  AUDIO_ROOM = 'audio_room',
  VIDEO_ROOM = 'video_room',
  CHAT_ONLY = 'chat_only',
}

export enum AccessControl {
  PUBLIC = 'public',
  PRIVATE = 'private',
} 

export class CreateLiveStreamDto {
  @IsString()
  @IsNotEmpty()
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
