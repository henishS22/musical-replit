import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { ProjectUpdateEnum } from '../utils/enums';

class InfoDto {
  @IsString()
  oldName?: string;

  @IsString()
  newName?: string;

  @IsString()
  comment?: string;

  @IsArray()
  @IsString({ each: true })
  tracks?: string[];
}

export class CreateProjectUpdateDto {
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @IsNotEmpty()
  @IsEnum(ProjectUpdateEnum)
  type: ProjectUpdateEnum;

  @ValidateIf((o) =>
    [
      ProjectUpdateEnum.ADDED_FILES_TO_FINAL_VERSION,
      ProjectUpdateEnum.ADDED_FILES_TO_RELEASE,
      ProjectUpdateEnum.CREATED_RELEASE,
      ProjectUpdateEnum.PUBLISHED_RELEASE,
    ].includes(o.type),
  )
  @IsString()
  release?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => InfoDto)
  info: InfoDto;

  @IsString()
  userId: string;
}
