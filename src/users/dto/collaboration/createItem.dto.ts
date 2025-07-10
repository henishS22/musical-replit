import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateCollabItemDto {
  // Required props
  @IsNotEmpty()
  @IsNumber()
  order: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}
