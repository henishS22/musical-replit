import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateSongContestDto {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  tracks: string[];

  @IsOptional()
  @IsString()
  brief: string;

  @IsOptional()
  @IsArray()
  seeking: string[];

  @IsOptional()
  @IsArray()
  styles: string[];

  @IsOptional()
  @IsArray()
  languages: string[];

  @IsOptional()
  @IsArray()
  designs: string[];
}
