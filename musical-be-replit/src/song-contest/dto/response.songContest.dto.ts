import { SkillsTypesResponseDto } from '@/src/docs/dto/skillsTypesResponse.dto';
import { StylesResponseDto } from '@/src/docs/dto/stylesResponse.dto';
import {
  CollaborateWithEnum,
  CollaborationTypeEnum,
} from '@/src/schemas/utils/enums';
import { TrackResponseDto } from '@/src/tracks/dto/definitions/trackResponse.dto';
import {
  DesignDto,
  LanguagesDto,
} from '@/src/users/dto/definitions/locationResponse.dto';
import { ApiProperty } from '@nestjs/swagger';

export class SongContestResponseDto {
  @ApiProperty({
    description: 'The Project ID',
    required: false,
  })
  projectId: string;

  @ApiProperty({
    description: 'The Song Contest title',
  })
  title: string;

  @ApiProperty({
    description: 'Tracks in the song contest',
    type: [TrackResponseDto],
  })
  tracks: TrackResponseDto[];

  @ApiProperty({
    description: 'The collaborator description',
  })
  brief: string;

  @ApiProperty({
    description: 'Array of skills',
    type: [SkillsTypesResponseDto],
  })
  seeking: SkillsTypesResponseDto[];

  @ApiProperty({
    description: 'Array of styles',
    type: [StylesResponseDto],
  })
  styles: StylesResponseDto[];

  @ApiProperty({
    description: 'Array of Langauges',
    type: [LanguagesDto],
  })
  languages: LanguagesDto[];

  @ApiProperty({
    description: 'Array of designs',
    type: [DesignDto],
  })
  designs: DesignDto[];

  @ApiProperty({
    description: 'Song Contest Type',
    enum: CollaborationTypeEnum,
  })
  collaborationType: CollaborationTypeEnum;

  @ApiProperty({
    description: 'Collaboration With Fans or Aritst',
    enum: CollaborateWithEnum,
  })
  collaborateWith: CollaborateWithEnum;
}
