import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { StatusReleaseEnum } from '../utils/enums';

class ContractDto {
  @IsNotEmpty()
  @IsString()
  user: string;

  @IsNotEmpty()
  @IsNumber()
  split: number;

  @IsNotEmpty()
  @IsBoolean()
  accepted: boolean;

  @IsString()
  @IsOptional()
  address?: string;
}

export class FundDistributionDto {
  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  totalDistributed: string;

  @IsString()
  @IsOptional()
  transactionHash: string;

  @IsString()
  @IsOptional()
  blockHash: string;
}

export class UpdateReleasesDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  selectedTracks?: string[];

  @IsOptional()
  @IsArray()
  finalVersions?: string[];

  @IsOptional()
  @IsArray()
  removeSelectedTracks?: string[];

  @IsOptional()
  @IsArray()
  removeFinalVersions?: string[];

  @IsOptional()
  @IsString()
  nft?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ContractDto)
  contracts?: ContractDto[];

  @IsOptional()
  @IsEnum(StatusReleaseEnum)
  status?: StatusReleaseEnum;

  @IsOptional()
  @IsString()
  splitContractAddress?: string;

  @IsOptional()
  @IsBoolean()
  isTokenGateKey?: boolean;

  @IsOptional()
  @IsString()
  editionContractAddress?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FundDistributionDto)
  fundDistributions?: FundDistributionDto[];
}
