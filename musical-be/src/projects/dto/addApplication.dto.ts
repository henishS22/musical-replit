import { IsNotEmpty, IsString } from 'class-validator';

export class AddApplicationDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  owner: string;

  @IsNotEmpty()
  @IsString()
  brief: string;

  @IsNotEmpty()
  @IsString()
  track: string;
}
