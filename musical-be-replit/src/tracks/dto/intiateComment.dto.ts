import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  ValidateNested,
} from 'class-validator';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

class DurationDto {
  @ApiProperty({
    description: 'Start time of the comment (in seconds)',
    example: 30,
  })
  @IsNumber()
  from: number;

  @ApiProperty({
    description: 'End time of the comment (in seconds)',
    example: 45,
  })
  @IsNumber()
  to: number;
}

export class IntiateCommentDto {
  @ApiPropertyOptional({
    description: 'The track ID',
  })
  @IsOptional()
  @IsString()
  track_id: string;

  @ApiPropertyOptional({
    description: 'The duration object containing from and to timestamps',
    type: DurationDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DurationDto)
  duration: DurationDto;

  @IsOptional()
  @IsString()
  comment?: string;
}
