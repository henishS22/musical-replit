import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsArray,
  IsString,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { SortOrder } from './getTracksFilter.dto';

export class GetFolderContentDto {
  @ApiProperty({ required: true })
  @IsString()
  folderID: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  limit?: number = 20;

  @ApiProperty({ required: false, enum: SortOrder })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genres?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  instruments?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
