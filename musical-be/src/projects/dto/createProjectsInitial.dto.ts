import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBooleanString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  PermissionProjectEnum,
  SplitModelEnum,
  TypeCollaboratorEnum,
} from '@/utils/enums';

export class CollaboratorsInitialDto {
  @ApiProperty({
    description: 'User ID. Not required if is an invited email.',
    required: false,
  })
  @ValidateIf((o) => o.invitedForProject !== 'true')
  @IsNotEmpty()
  @IsString()
  user: string;

  @ApiProperty({
    description: 'Invited email. Not required if is an user ID.',
    required: false,
  })
  @ValidateIf((o) => o.invitedForProject === 'true')
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Collaborator roles',
  })
  @IsOptional()
  @IsArray()
  roles: string[];

  @ApiProperty({
    description: 'Collaborator permissions',
    enum: PermissionProjectEnum,
  })
  @IsNotEmpty()
  @IsEnum(PermissionProjectEnum)
  permission: string;

  @ApiProperty({
    description: 'Collaborator split percentage',
  })
  @IsOptional()
  @IsString()
  split: string;

  @ApiProperty({
    description: 'Flag if the collaborator is invited for the app',
  })
  @IsOptional()
  @IsBooleanString()
  invitedForProject: boolean;
}

export class CreateProjectsInitialDto {
  @IsOptional()
  @IsString()
  user: string;

  @ApiProperty({
    description: 'Owner user roles in project',
  })
  @IsOptional()
  @IsArray()
  ownerRoles: string[];

  @ApiProperty({
    description: 'Project name',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Project split model',
    enum: SplitModelEnum,
  })
  @IsNotEmpty()
  @IsEnum(SplitModelEnum)
  splitModel: string;

  @ApiProperty({
    description: 'Project split',
    required: false,
  })
  @IsOptional()
  @IsString()
  split: string;

  @ApiProperty({
    description: 'Project type',
    enum: TypeCollaboratorEnum,
  })
  @IsNotEmpty()
  @IsEnum(TypeCollaboratorEnum)
  type: string;

  @ApiProperty({
    description: 'Project artwork URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  artworkUrl: string;

  @ApiProperty({
    description: 'Project collaborators',
    type: [CollaboratorsInitialDto],
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CollaboratorsInitialDto)
  @ArrayUnique((collaborator) => collaborator.user || collaborator.email)
  collaborators: CollaboratorsInitialDto[];

  @ApiProperty({
    description: 'Track id to link with project',
  })
  @IsOptional()
  @IsString()
  trackId: string;
}
