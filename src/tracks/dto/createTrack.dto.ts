import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsUrl,
  IsBoolean,
} from 'class-validator';

import { TransportAudioType, TransportImageType } from '../utils/types';

export class createTrack {
  // Required props
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  artwork?: TransportImageType;

  @IsOptional()
  imageWaveSmall?: TransportImageType;

  @IsOptional()
  imageWaveBig?: TransportImageType;

  @IsOptional()
  file?: TransportAudioType;

  @IsOptional()
  @IsString()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  driveToken?: string;

  @IsOptional()
  @IsString()
  extension?: 'wav' | 'mp3' | 'm4a' | 'mp4' | 'avi' | 'zip' | 'ptx';

  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsOptional()
  @IsString()
  folder_id?: string;

  @IsOptional()
  @IsString()
  project_id?: string;

  @IsOptional()
  @IsArray()
  instrument?: [string];

  @IsOptional()
  @IsArray()
  genre?: [string];

  @IsOptional()
  @IsArray()
  tags?: [string];

  @IsOptional()
  @IsNumber()
  size?: number;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsNumber()
  channels?: number;

  @IsOptional()
  @IsNumber()
  rate?: number;

  @IsOptional()
  @IsNumber()
  bitrate?: number;

  @IsOptional()
  @IsNumber()
  BPM?: number;

  @IsOptional()
  @IsNumber()
  resolution?: number;

  @IsOptional()
  @IsNumber()
  version?: number;

  @IsOptional()
  @IsNumber()
  previewStart?: number;

  @IsOptional()
  @IsNumber()
  previewEnd?: number;

  @IsOptional()
  @IsString()
  previewExtension?: string;

  @IsOptional()
  @IsBoolean()
  isMobileRecorded?: boolean
}
