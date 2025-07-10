import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';
import { LyricsDto } from './lyrics.dto';

export class AttachLyricsDto {
  @ApiProperty({
    description: 'Lyrics',
    type: [LyricsDto],
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => LyricsDto)
  lyrics: LyricsDto[];
}
