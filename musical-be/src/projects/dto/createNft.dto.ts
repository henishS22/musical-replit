import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsDate,
  IsOptional,
} from 'class-validator';

import { TransportImageType } from '../utils/types';

export class CreateNftDto {
  @IsNotEmpty()
  @IsString()
  user: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  initialSupply: string;

  // @IsNotEmpty()
  // file: TransportImageType;

  @IsNotEmpty()
  @IsString()
  project: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional() // Not required now
  @IsString()
  release: string;

  @IsNotEmpty()
  @IsString()
  artworkExension: 'bmp' | 'jpeg' | 'png';

  @IsNotEmpty()
  @IsString()
  artworkUrl: string;

  @IsNotEmpty()
  @IsString()
  chainId: string;

  @IsNotEmpty()
  @IsString()
  wallet: string;

  @IsOptional()
  @IsInt()
  tokenId?: number;

  @IsOptional()
  @IsString()
  checkoutUrl?: string;

  @IsOptional()
  @IsString()
  editionContractAddress?: string;

  @IsOptional()
  @IsString()
  splitContractAddress?: string;

  @IsOptional()
  @IsString()
  listingId?: string;

  @IsNotEmpty()
  @IsString()
  price?: string;

  @IsOptional()
  @IsDate()
  listedAt?: Date;

  @IsOptional()
  @IsString()
  transactionHash?: string;

  @IsOptional()
  @IsString()
  tokenUri?: string;
}
