import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
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
  @ApiPropertyOptional({
    description: 'Lyrics ID. Not required when creating a new lyrics',
  })
  @ValidateIf((value) => !value.title && !value.lines?.length)
  @IsMongoId()
  id?: string;

  @ApiPropertyOptional({
    description: 'Lyrics title. Not required when updating an existing lyrics',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((value) => !value.id)
  title?: string;

  @ApiProperty({
    description: 'Lyrics lines',
    type: String,
  })

  lines: string;

  // @ApiProperty({
  //   description: 'Lyrics lines',
  //   type: [LyricsLineDto],
  // })
  // @IsNotEmpty()
  // @IsArray()
  // @ValidateNested()
  // @Type(() => LyricsLineDto)
  // @ValidateIf((value) => !value.id)
  // lines: LyricsLineDto[];
}

export class CreateLyricsDto {
  @ApiPropertyOptional({
    description: 'Lyrics title. Not required when updating an existing lyrics',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((value) => !value.id)
  title?: string;

  @ApiProperty({
    description: 'Lyrics lines',
    type: [LyricsLineDto],
  })
  @IsNotEmpty()
  lines?: string;

  // @ApiProperty({
  //   description: 'Lyrics lines',
  //   type: [LyricsLineDto],
  // })
  // @IsNotEmpty()
  // @IsArray()
  // @ValidateNested()
  // @Type(() => LyricsLineDto)
  // @ValidateIf((value) => !value.id)
  // lines: LyricsLineDto[];
}
