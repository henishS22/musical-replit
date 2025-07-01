import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsDate,
  IsArray,
  IsBoolean,
  IsNumber,
  ValidateNested,
} from 'class-validator';

class CreateNftInputContractDto {
  @ApiProperty({
    description: 'User ID',
  })
  @IsNotEmpty()
  @IsString()
  user: string | any;

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

export class CreateNftInputDto {
  @ApiProperty({
    description: 'User ID',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  user: string;

  @ApiProperty({
    description: 'Project ID',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  project: string;

  @ApiProperty({
    description: 'Release ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  release: string;

  @ApiProperty({
    description: 'Link to Purchase',
    required: false,
  })
  @IsOptional()
  @IsString()
  checkoutUrl: string;

  @ApiProperty({
    description: 'Description',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'edition contract address',
    required: false,
  })
  @IsOptional()
  @IsString()
  editionContractAddress: string;

  @ApiProperty({
    description: 'split contract address',
    required: false,
  })
  @IsOptional()
  @IsString()
  splitContractAddress: string;

  @ApiProperty({
    description: 'marketplace listing id',
    required: false,
  })
  @IsOptional()
  @IsString()
  listingId: string;

  @ApiProperty({
    description: 'token id',
    required: false,
  })
  @IsOptional()
  @IsInt()
  tokenId: number;

  @ApiProperty({
    description: 'date listed',
    required: false,
  })
  @IsOptional()
  @IsDate()
  listedAt: Date;

  @ApiProperty({
    description: 'name/title of NFT',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'price of NFT',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  price: string;

  @ApiProperty({
    description: 'Initial Supply',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  initialSupply: string;

  @ApiProperty({
    description: 'Chain ID',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  chainId: string;

  @ApiProperty({
    description:
      'The Wallet that paid for the creation of the NFT and related contracts',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  wallet: string;

  @ApiPropertyOptional({
    description: 'Release tracks',
  })
  @IsOptional()
  @IsArray()
  selectedTracks?: string[];

  @ApiPropertyOptional({
    description: 'Release final versions',
  })
  @IsOptional()
  @IsArray()
  finalVersions?: string[];

  @ApiProperty({
    description: 'Release contracts',
    type: [CreateNftInputContractDto],
  })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateNftInputContractDto)
  contracts: CreateNftInputContractDto[];

  @ApiProperty({
    description: 'Transaction Hash for mint and list'
  })
  @IsNotEmpty()
  @IsString()
  transactionHash: string;

  @ApiProperty({
    description: 'Token URI'
  })
  @IsOptional()
  @IsString()
  tokenUri: string;

  @ApiProperty({
    description: 'Artwork URL'
  })
  @IsOptional()
  @IsString()
  artworkUrl: string;

  @ApiProperty({
    description: 'Artwork Extension'
  })
  @IsOptional()
  @IsString()
  artworkExtension: string;
}
