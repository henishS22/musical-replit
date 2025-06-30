import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LyricsLineWordChord {
  @ApiProperty({
    description: 'Chord',
  })
  chord: string;

  @ApiProperty({
    description: 'Line index',
  })
  lineIndex: number;

  @ApiProperty({
    description: 'Chord position',
  })
  position: number;
}

export class LyricsLineWordDto {
  @ApiPropertyOptional({
    description: 'Word text',
  })
  text?: string;

  @ApiProperty({
    description: 'Word chords',
    type: [LyricsLineWordChord],
  })
  chords: LyricsLineWordChord[];
}

export class LyricsLineDto {
  @ApiProperty({
    description: 'Line text composed by words',
    type: [LyricsLineWordDto],
  })
  words: LyricsLineWordDto[];
}

export class LyricsResponseDto {
  @ApiPropertyOptional({
    description: 'Lyrics ID',
  })
  _id: string;

  @ApiPropertyOptional({
    description: 'Lyrics title',
  })
  title?: string;

  @ApiProperty({
    description: 'Lyrics lines',
    type: [LyricsLineDto],
  })
  lines?: LyricsLineDto[];
}
