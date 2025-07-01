import { IsString } from 'class-validator';
import { Provider } from '../../utils/enums';

export class CreateWalletAccount {
  @IsString()
  owner: string;
  @IsString()
  addr: string;
  @IsString()
  provider: Provider;
}
