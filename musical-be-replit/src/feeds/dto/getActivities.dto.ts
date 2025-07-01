import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ProjectActivityTypeEnum } from '../utils/enums';
import { ApiProperty } from '@nestjs/swagger';

export class GetActivitiesDto {
  @ApiProperty({
    description: 'ID offset for pagination',
    required: false,
  })
  @IsOptional()
  @IsString()
  afterId?: string;

  @ApiProperty({
    description: 'Number of activities to return',
    required: false,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Min(1)
  @Max(50)
  @IsInt()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    description: 'Filter by activity type',
    required: false,
    type: [ProjectActivityTypeEnum],
  })
  @IsOptional()
  @IsEnum(ProjectActivityTypeEnum, { each: true })
  @ArrayUnique()
  types?: ProjectActivityTypeEnum[];
}
