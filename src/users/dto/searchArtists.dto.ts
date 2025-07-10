import {
  IsArray,
  IsBooleanString,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchArtistsDto {
  @ApiProperty({
    description: 'The search query',
    required: false,
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({
    description: 'Flag to sorting',
    required: false,
  })
  @IsOptional()
  @IsBooleanString()
  sort?: boolean;

  @ApiProperty({
    required: false,
    description: 'The skills IDs to filter by',
  })
  @IsOptional()
  @IsArray()
  skills?: string[];

  @ApiProperty({
    required: false,
    description: 'The styles IDs to filter by',
  })
  @IsOptional()
  @IsArray()
  styles?: string[];

  @ApiProperty({
    description: 'The page number',
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiProperty({
    description: 'The limit of items per page',
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  limit?: string;
}
