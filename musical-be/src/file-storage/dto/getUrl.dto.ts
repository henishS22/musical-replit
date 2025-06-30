/**
 *  @file Schema DTO (data transfer object) file. Create and exports a DTO to be use for params validations
 *  @author Rafael Marques Siqueira
 *  @exports GetUrlDto
 */

import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

//Based on
//https://docs.nestjs.com/techniques/validation

export class GetUrlDto {
  @IsNotEmpty()
  @IsString()
  name: string | string[];

  @IsOptional()
  @IsNumber()
  minutesToExpiry?: number;
}
