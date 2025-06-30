import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { CollaboratorsDto } from '.';
import { SplitModelEnum, TypeCollaboratorEnum } from '@/utils/enums';

export class UpdateProjectsInputDto {
  @ApiPropertyOptional({
    description: 'Project name',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique((role) => role)
  ownerRoles: string[];

  @IsOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Project split model',
    enum: SplitModelEnum,
  })
  @IsOptional()
  @IsEnum(SplitModelEnum)
  splitModel: string;

  @ApiPropertyOptional({
    description: 'Project split',
  })
  @IsOptional()
  @IsString()
  split: string;

  @ApiPropertyOptional({
    description: 'Is Public',
  })
  @IsOptional()
  isPublic: boolean;

  @ApiPropertyOptional({
    description: 'Project type',
    enum: TypeCollaboratorEnum,
  })
  @IsOptional()
  @IsEnum(TypeCollaboratorEnum)
  type: string;

  @ApiPropertyOptional({
    description: 'Project collaborators',
    type: [CollaboratorsDto],
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CollaboratorsDto)
  @ArrayUnique((collaborator) => collaborator.user || collaborator.email)
  collaborators: CollaboratorsDto[];

  @ApiPropertyOptional({
    description: 'Flag when no collaborators are invited',
  })
  @IsOptional()
  @IsString()
  emptyCollaborators: string;

  @ApiPropertyOptional({
    description: 'YouTube video URL',
  })
  @IsOptional()
  @IsString()
  youtube: string;

  @ApiPropertyOptional({
    description: 'Spotify URL',
  })
  @IsOptional()
  @IsString()
  spotify: string;
}
