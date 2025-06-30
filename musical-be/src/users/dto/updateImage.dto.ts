/**
 *  @file Schema DTO (data transfer object) file. Create and exports a DTO to be use for params validations
 *  @author Rafael Marques Siqueira
 *  @exports UpdateImageDto
 */

import { IsNotEmpty, IsString } from 'class-validator';
import { TransportImageType } from '../utils/types';

//Based on
//https://docs.nestjs.com/techniques/validation

export class UpdateImageDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  file: TransportImageType;
}
