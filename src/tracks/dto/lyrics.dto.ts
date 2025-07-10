import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class LyricsLineWordChord {
  @IsDefined()
  @IsString()
  chord: string;

  @IsDefined()
  @IsNumber()
  @Min(0)
  lineIndex: number;

  @IsDefined()
  @IsNumber()
  position: number;
}

export class LyricsLineWordDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsDefined()
  @IsArray()
  @ValidateNested()
  @Type(() => LyricsLineWordChord)
  chords: LyricsLineWordChord[];
}

export class LyricsLineDto {
  @IsDefined()
  @IsArray()
  @ValidateNested()
  @Type(() => LyricsLineWordDto)
  words: LyricsLineWordDto[];
}

export class LyricsDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsDefined()
  @IsString()
  @IsOptional()
  // @IsArray()
  // @ValidateNested()
  // @Type(() => LyricsLineDto)
  // lines: LyricsLineDto[];
  lines?: string;
}
