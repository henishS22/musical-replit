import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  ValidateNested,
  ArrayUnique,
  IsArray,
  IsDate,
} from 'class-validator';
import { CollaboratorsDto } from '.';
import { SplitModelEnum, TypeCollaboratorEnum } from '../utils/enums';
import { TransportImageType } from '../utils/types';

export class UpdateProjectsDto {
  @IsOptional()
  @IsArray()
  ownerRoles?: string[];

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  file?: TransportImageType;

  @IsOptional()
  coverImage?: TransportImageType;

  @IsOptional()
  @IsEnum(SplitModelEnum)
  splitModel?: string;

  @IsOptional()
  @IsNumber()
  split?: number;

  @IsOptional()
  @IsEnum(TypeCollaboratorEnum)
  type?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CollaboratorsDto)
  @ArrayUnique((collaborator) => collaborator.user || collaborator.email)
  collaborators?: CollaboratorsDto[];

  @IsOptional()
  @IsBoolean()
  emptyCollaborators?: boolean;

  @IsOptional()
  @IsString()
  youtube?: string;

  @IsOptional()
  @IsString()
  spotify?: string;

  @IsOptional()
  @IsString()
  artworkExension?: 'bmp' | 'jpeg' | 'png';

  @IsOptional()
  @IsString()
  coverExtension?: 'bmp' | 'jpeg' | 'png';

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsDate()
  deadline?: Date;
}
