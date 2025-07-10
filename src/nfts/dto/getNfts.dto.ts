import { IsString, IsOptional, IsNotEmpty, IsBoolean } from 'class-validator';

export class GetNftsDto {
  @IsNotEmpty()
  @IsString()
  offset: string;

  @IsNotEmpty()
  @IsString()
  page: string;

  @IsNotEmpty()
  @IsString()
  limit: string;

  @IsOptional()
  @IsString()
  userId: string;

  @IsOptional()
  @IsBoolean()
  isListed: boolean;

  @IsOptional()
  @IsBoolean()
  includeUsdPrice: boolean;
}
