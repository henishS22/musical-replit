import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateCollabItemDto {
  // Required props
  @IsNotEmpty()
  @IsNumber()
  order: number;

  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description: string;
}
