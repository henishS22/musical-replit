import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class createFolder {
  // Required props
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  parent_id: string;
}
