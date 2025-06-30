/**
 *  @file Schema DTO (data transfer object) file. Create and exports a DTO to be use for params validations
 *  @author Austin Imperial
 *  @exports CreatePreviewDto
 */

import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePreviewDto {
  @IsNotEmpty()
  @IsString()
  trackId: string;

  @IsNotEmpty()
  @IsString()
  startInSec: string;

  @IsNotEmpty()
  @IsString()
  endInSec: string;
}
