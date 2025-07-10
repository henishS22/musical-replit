import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class addFilters {
  @ApiProperty({
    description: 'Array of styles IDs',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  @Transform(({ value }) =>
    typeof value == 'string' ? value.split(',') : value || [],
  )
  styles: string[];

  @ApiProperty({
    description: 'Array of seeking skills IDs',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  @Transform(({ value }) =>
    typeof value == 'string' ? value.split(',') : value || [],
  )
  seeking: string[];

  @ApiProperty({
    description: 'Array of skills IDs',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  @Transform(({ value }) =>
    typeof value == 'string' ? value.split(',') : value || [],
  )
  skillsOffered: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  @Transform(({ value }) =>
    typeof value == 'string' ? value.split(',') : value || [],
  )
  languages: string[];

  @ApiProperty()
  @IsOptional()
  @IsString()
  txtFilter: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  projectId: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  offSet: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  selectedTabFilter: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  sortBy: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  collaborateWith: string;
}
