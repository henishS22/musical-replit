import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TransportImageType } from '../../utils/types';

export class CreateCollabDto {
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  track: string;

  @IsNotEmpty()
  @IsString()
  brief: string;

  @IsNotEmpty()
  artwork: TransportImageType;

  @IsOptional()
  @IsString()
  artworkExtension: 'bmp' | 'jpeg' | 'png';

  @IsNotEmpty()
  @IsArray()
  seeking: string[];

  @IsNotEmpty()
  @IsArray()
  skillsOffered: string[];

  @IsNotEmpty()
  @IsArray()
  styles: string[];
}
