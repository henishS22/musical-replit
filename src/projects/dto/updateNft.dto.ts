import { IsString, IsInt, IsDate, IsOptional, IsObject } from 'class-validator';

export class TCustomSettings {
  @IsOptional()
  @IsString()
  mainBackground?: string;

  @IsOptional()
  @IsString()
  textColor?: string;

  @IsOptional()
  @IsString()
  background1?: string;

  @IsOptional()
  @IsString()
  background2?: string;

  @IsOptional()
  @IsString()
  background3?: string;

  @IsOptional()
  @IsString()
  background4?: string;

  @IsOptional()
  @IsString()
  background5?: string;

  @IsOptional()
  @IsString()
  background6?: string;

  @IsOptional()
  @IsString()
  background7?: string;
}

export class UpdateNftDto {
  @IsOptional()
  @IsString()
  user: string;

  @IsOptional()
  @IsString()
  project: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  release: string;

  @IsOptional()
  @IsString()
  checkoutUrl: string;

  @IsOptional()
  @IsString()
  editionContractAddress: string;

  @IsOptional()
  @IsString()
  splitContractAddress: string;

  @IsOptional()
  @IsString()
  listingId: string;

  @IsOptional()
  @IsInt()
  tokenId: number;

  @IsOptional()
  @IsDate()
  listedAt: Date;

  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsObject()
  tracksIpfsIds: {
    [x: string]: string;
  };

  @IsOptional()
  @IsObject()
  customSettings: TCustomSettings;

  @IsOptional()
  @IsString()
  chainId: string;

  @IsOptional()
  @IsString()
  wallet: string;
}
