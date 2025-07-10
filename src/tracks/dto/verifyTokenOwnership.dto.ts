import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyTokenOwnershipDto {
  @IsNotEmpty()
  @IsString()
  signature: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsString()
  nftId: string;
}
