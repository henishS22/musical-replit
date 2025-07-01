import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { StatusReleaseEnum } from '../utils/enums';

export class CreateReleaseInputContractDto {
  @ApiProperty({
    description: 'User ID',
  })
  @IsNotEmpty()
  @IsString()
  user: string;

  @ApiProperty({
    description: 'Contract split percentage',
  })
  @IsNotEmpty()
  @IsNumber()
  split: number;

  @ApiProperty({
    description: 'Contract status',
  })
  @IsNotEmpty()
  @IsBoolean()
  accepted: boolean;

  @ApiProperty({
    description: 'user wallet address',
  })
  @IsString()
  @IsOptional()
  address?: string;
}

export class CreateReleaseInputDto {
  @ApiProperty({
    description: 'Release title',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Release tracks',
  })
  @IsOptional()
  @IsArray()
  selectedTracks?: string[];

  @IsOptional()
  @IsBoolean()
  isTokenGateKey?: boolean;

  @ApiPropertyOptional({
    description: 'Release final versions',
  })
  @IsOptional()
  @IsArray()
  finalVersions?: string[];

  @ApiPropertyOptional({
    description: 'Release NFT',
  })
  @IsOptional()
  @IsString()
  nft?: string;

  @ApiProperty({
    description: 'Release contracts',
    type: [CreateReleaseInputContractDto],
  })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateReleaseInputContractDto)
  contracts: CreateReleaseInputContractDto[];

  @ApiProperty({
    description: 'Release status',
    enum: StatusReleaseEnum,
  })
  @IsNotEmpty()
  @IsEnum(StatusReleaseEnum)
  status: StatusReleaseEnum;
}
