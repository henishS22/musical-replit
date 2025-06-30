import { IsString, IsOptional, IsNotEmpty, IsBoolean, IsArray, ValidateNested, IsNumber, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

class TrackDto {
  @IsOptional()
  @IsString()
  artist?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsMongoId()
  trackId?: string;
}

class ArtistDto {
  @IsOptional()
  @IsString()
  performerCredit?: string;

  @IsOptional()
  @IsString()
  writeCredit?: string;

  @IsOptional()
  @IsString()
  additionalCredit?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsArray()
  genre?: string[];
}

class TrackMetadataDto {
  @IsOptional()
  @IsString()
  labelName?: string;

  @IsOptional()
  @IsString()
  copyrightName?: string;

  @IsOptional()
  @IsNumber()
  copyrightYear?: number;

  @IsOptional()
  @IsString()
  countryOfRecording?: string;

  @IsOptional()
  @IsString()
  trackISRC?: string;

  @IsOptional()
  @IsString()
  lyrics?: string;
}

class OwnershipDto {
  @IsNotEmpty()
  @IsBoolean()
  ownership: boolean;

  @IsOptional()
  @IsString()
  territories?: string;
}

class CompositionRightsDto {
  @IsNotEmpty()
  @IsString()
  composerName: string;

  @IsNotEmpty()
  @IsNumber()
  percentageOfOwnership: number;

  @IsOptional()
  @IsString()
  rightsManagement?: string;
}

class CollaboratorDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  percentageOfOwnership: number;

  @IsOptional()
  @IsString()
  walletAddress?: string;
}

class ReleaseStatusDto {
  @IsNotEmpty()
  @IsBoolean()
  previouslyReleased: boolean;

  @IsOptional()
  @IsString()
  upc?: string;

  @IsOptional()
  releaseDate?: Date;
}

export class MetadataDto {
  @IsOptional()
  @IsMongoId()
  projectId?: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => TrackDto)
  track: TrackDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ArtistDto)
  artist: ArtistDto;

  @IsOptional()
  @IsArray()
  collaborators?: any[];

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => TrackMetadataDto)
  trackMetadata: TrackMetadataDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => OwnershipDto)
  ownership: OwnershipDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompositionRightsDto)
  compositionRights?: CompositionRightsDto[];

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ReleaseStatusDto)
  releaseStatus: ReleaseStatusDto;

  @IsOptional()
  @IsBoolean()
  isSendForRelease?: boolean;
}
