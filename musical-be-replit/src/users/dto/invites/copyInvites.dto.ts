import { IsNotEmpty, IsString } from 'class-validator';

export class CopyInvitesDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  owner: string;
}
