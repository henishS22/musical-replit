import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ReactionsTypes } from '../utils/enums';
import { ApiProperty } from '@nestjs/swagger';

export class GetReactionsDto {
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
    description: 'Filter by reaction type',
    required: false,
    enum: ReactionsTypes,
  })
  @IsOptional()
  @IsString()
  @IsEnum(ReactionsTypes)
  type?: ReactionsTypes;
}
