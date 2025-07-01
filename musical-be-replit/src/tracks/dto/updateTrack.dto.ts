import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ObjectId } from 'mongodb';
import { ImageFileType } from '../utils/types';
import { LyricsDto } from './lyrics.dto';

export class updateTrack {
  // Required props
  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  @IsOptional()
  folder_id?: ObjectId;

  @IsString()
  @IsOptional()
  project_id?: ObjectId;

  @IsArray()
  @IsOptional()
  instrument?: [ObjectId];

  @IsArray()
  @IsOptional()
  genre?: [ObjectId];

  @IsArray()
  @IsOptional()
  tags?: [ObjectId];

  @IsNumber()
  @IsOptional()
  size?: number;

  @IsNumber()
  @IsOptional()
  duration?: number;

  @IsNumber()
  @IsOptional()
  channels?: number;

  @IsString()
  @IsOptional()
  album?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => LyricsDto)
  lyrics?: LyricsDto;

  @IsString()
  @IsOptional()
  comments?: string;

  @IsNumber()
  @IsOptional()
  rate?: number;

  @IsNumber()
  @IsOptional()
  rating?: number;

  @IsNumber()
  @IsOptional()
  bitrate?: number;

  @IsNumber()
  @IsOptional()
  resolution?: number;

  @IsNumber()
  @IsOptional()
  version?: number;

  @IsString()
  @IsOptional()
  imageWaveSmall?: ImageFileType;

  @IsString()
  @IsOptional()
  imageWaveBig?: ImageFileType;

  @IsString()
  @IsOptional()
  artwork?: ImageFileType;

  @IsBoolean()
  @IsOptional()
  favorite?: boolean;

  @IsOptional()
  @IsNumber()
  previewStart?: number;

  @IsOptional()
  @IsNumber()
  previewEnd?: number;

  @IsOptional()
  @IsString()
  previewExtension?: string;
}
