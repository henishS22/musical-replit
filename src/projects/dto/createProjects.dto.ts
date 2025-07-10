import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBooleanString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
  IsDate,
} from 'class-validator';
import {
  PermissionProjectEnum,
  SplitModelEnum,
  TypeCollaboratorEnum,
} from '../utils/enums';
import { TransportImageType } from '../utils/types';

export class CollaboratorsDto {
  @ValidateIf((o) => o.invitedForProject !== 'true')
  @IsNotEmpty()
  @IsString()
  user: string;

  @ValidateIf((o) => o.invitedForProject === 'true')
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsArray()
  roles: string[];

  @IsNotEmpty()
  @IsEnum(PermissionProjectEnum)
  permission: string;

  @IsOptional()
  @IsString()
  split: string | number;

  @IsOptional()
  @IsBooleanString()
  invitedForProject: boolean;
}

export class CreateProjectsDto {
  @IsNotEmpty()
  @IsString()
  user: string;

  @IsNotEmpty()
  @IsArray()
  ownerRoles: string[];

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  file: TransportImageType;

  @IsOptional()
  @IsString()
  artworkExension?: 'bmp' | 'jpeg' | 'png';

  @IsNotEmpty()
  @IsEnum(SplitModelEnum)
  splitModel: string;

  @IsOptional()
  @IsNumber()
  split?: number;

  @IsOptional()
  @IsDate()
  deadline?: Date;

  @IsNotEmpty()
  @IsEnum(TypeCollaboratorEnum)
  type: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CollaboratorsDto)
  @ArrayUnique((collaborator) => collaborator.user || collaborator.email)
  collaborators?: CollaboratorsDto[];

  @IsOptional()
  @IsString()
  artworkUrl?: string;

  @IsOptional()
  @IsString()
  trackId?: string;
}
