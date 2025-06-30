import { IsString } from 'class-validator';
import { LyricsDto } from './lyrics.dto';

export class ReadLyricsFromUserDto extends LyricsDto {
  @IsString()
  userId: string;
}
