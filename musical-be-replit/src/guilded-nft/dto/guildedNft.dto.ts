import { IsString, IsOptional, IsNotEmpty, IsBoolean } from 'class-validator';

export class GetGuildedNftsDto {
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

}
