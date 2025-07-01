import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import { LyricsDto } from './lyrics.dto';

export class CreateLyricsDto extends LyricsDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @IsOptional()
  @IsMongoId()
  projectId?: string;

  @IsOptional()
  @IsMongoId()
  trackId?: string;
}
