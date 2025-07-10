import { Type } from 'class-transformer';
import { CollaboratorsDto } from '.';

import {
  ArrayUnique,
  ValidateNested,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
} from 'class-validator';

export class UpdateProjectCollaboratorsDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  owner?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique((role) => role)
  ownerRoles?: string[];

  @IsOptional()
  @IsString()
  split?: number;

  @ValidateNested()
  @Type(() => CollaboratorsDto)
  @ArrayUnique((collaborator) => collaborator.user || collaborator.email)
  @IsNotEmpty()
  collaborators?: CollaboratorsDto[];
}
