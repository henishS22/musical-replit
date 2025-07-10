import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateInvitesDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}
