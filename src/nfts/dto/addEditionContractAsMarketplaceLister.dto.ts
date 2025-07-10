import { IsString, IsNotEmpty } from 'class-validator';

export class AddEditionContractAsMarketplaceListerDto {
  @IsString()
  @IsNotEmpty()
  nftId: string;
}
