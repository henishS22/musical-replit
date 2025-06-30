/**
 *  @file Schema DTO (data transfer object) file. Create and exports a DTO to be use for params validations
 *  @author Rafael Marques Siqueira
 *  @exports FileUploadDto
 */

import { IsNotEmpty, IsString, IsBoolean, IsNumber } from 'class-validator';

//Based on
//https://docs.nestjs.com/techniques/validation

export class FileUploadDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  fileCacheKey: string;

  @IsNotEmpty()
  @IsString()
  mimetype: string;

  @IsNotEmpty()
  @IsNumber()
  size: number;

  @IsNotEmpty()
  @IsBoolean()
  isPublic: boolean;
}
