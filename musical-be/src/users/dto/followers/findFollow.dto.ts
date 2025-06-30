/**
 *  @file Schema DTO (data transfer object) file. Create and exports a DTO to be use for params validations
 *  @author Rafael Marques Siqueira
 *  @exports FindFollow
 */

import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class FindFollow {
  @IsNotEmpty()
  @IsString()
  user: Types.ObjectId;
}
