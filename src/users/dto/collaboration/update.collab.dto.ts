import { IsArray, IsOptional, IsString } from 'class-validator';
import { TransportImageType } from '../../utils/types';

export class UpdateCollabDto {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  track: string;

  @IsOptional()
  @IsString()
  brief: string;

  @IsOptional()
  artwork: TransportImageType;

  @IsOptional()
  @IsString()
  artworkExtension: 'bmp' | 'jpeg' | 'png';

  @IsOptional()
  @IsArray()
  seeking: string[];

  @IsOptional()
  @IsArray()
  skillsOffered: string[];

  @IsOptional()
  @IsArray()
  styles: string[];
}
