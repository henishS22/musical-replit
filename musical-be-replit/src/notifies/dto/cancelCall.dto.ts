import { IsNotEmpty, IsString } from 'class-validator';

export class CancelCall {
  @IsNotEmpty()
  @IsString()
  user_target: string;
}
