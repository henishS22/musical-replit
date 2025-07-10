import {
  CollaborateWithEnum,
  CollaborationTypeEnum,
} from '@/src/schemas/utils/enums';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class SongContestDto {
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  brief: string;

  @IsOptional()
  seeking: string[];

  // @IsOptional()
  // @IsArray()
  // skillsOffered: string[];

  @IsOptional()
  @IsArray()
  styles: string[];

  @IsNotEmpty()
  @IsArray()
  languages: string[];

  @IsOptional()
  @IsEnum(CollaborationTypeEnum)
  collaborationType: string;

  @IsNotEmpty()
  @IsEnum(CollaborateWithEnum)
  collaborateWith: string;

  @IsNotEmpty()
  duration: {
    startFrom: Date;
    endTo: Date;
  };

  @IsOptional()
  @IsArray()
  designs: string[];

  @IsNotEmpty()
  @IsArray()
  tracks: string[];
}
