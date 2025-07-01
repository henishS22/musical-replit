import { Type } from 'class-transformer';
import { IsString, IsOptional, IsNotEmpty, IsBoolean, IsNumber, IsArray, ValidateNested, IsObject } from 'class-validator';

class MetaDataDto {
  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];
}

export class CreatorQuestDto {
  @IsOptional()
  @IsString()
  questId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => MetaDataDto)
  metaData?: MetaDataDto;
}

export class UpdateCreatorQuestDto {
  @IsString()
  creatorQuestId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MetaDataDto)
  metaData?: MetaDataDto;
}

export class PublishedQuestDto {
  @IsString()
  creatorQuestId: string;

  @IsBoolean()
  isPublished: boolean;
}