/**
 *  @file Schema DTO (data transfer object) file. Create and exports a DTO to be use for params validations
 *  @author Rafael Marques Siqueira
 *  @exports FileDeleteDto
 */

import { IsNotEmpty, IsString } from 'class-validator';

//Based on
//https://docs.nestjs.com/techniques/validation

export class FileDeleteDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
