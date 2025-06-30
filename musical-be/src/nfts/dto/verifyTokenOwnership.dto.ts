import { IsNotEmpty } from 'class-validator';

export class VerifyTokenOwnershipDto {
  @IsNotEmpty()
  signature: string;

  @IsNotEmpty()
  message: string;

  @IsNotEmpty()
  tokenId: string;

  @IsNotEmpty()
  chainId: string;

  @IsNotEmpty()
  contractAddress: string;
}
