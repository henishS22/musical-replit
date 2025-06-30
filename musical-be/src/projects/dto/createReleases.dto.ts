import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { StatusReleaseEnum } from '../utils/enums';

export class ContractDto {
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

export class CreateReleasesDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  selectedTracks?: string[];

  @IsOptional()
  @IsArray()
  finalVersions?: string[];

  @IsOptional()
  @IsString()
  nft?: string;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ContractDto)
  contracts: ContractDto[];

  @IsNotEmpty()
  @IsEnum(StatusReleaseEnum)
  status: StatusReleaseEnum;

  @IsOptional()
  @IsString()
  splitContractAddress?: string;

  @IsOptional()
  @IsString()
  editionContractAddress?: string;
}
