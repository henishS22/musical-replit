import { IsString } from 'class-validator';
import { LyricsDto } from './lyrics.dto';

export class UpdateLyricsDto extends LyricsDto {
  @IsString()
  id: string;

  // @IsOptional()
  // @IsString()
  // title?: string;

  @IsString()
  owner: string;
}
