import { SkillsTypesResponseDto } from '@/src/docs/dto/skillsTypesResponse.dto';
import { StylesResponseDto } from '@/src/docs/dto/stylesResponse.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CollaborationResponseDto {
  @ApiProperty({
    description: 'The project ID',
    required: false,
  })
  projectId: string;

  @ApiProperty({
    description: 'The collaborator title',
  })
  title: string;

  @ApiProperty({
    description: 'Track ID',
  })
  track: string;

  @ApiProperty({
    description: 'The collaborator description',
  })
  brief: string;

  @ApiProperty({
    description: 'Array of seeking skills',
    type: [SkillsTypesResponseDto],
  })
  seeking: SkillsTypesResponseDto[];

  @ApiProperty({
    description: 'Array of skills',
    type: [SkillsTypesResponseDto],
  })
  skillsOffered: SkillsTypesResponseDto[];

  @ApiProperty({
    description: 'Array of styles',
    type: [StylesResponseDto],
  })
  styles: StylesResponseDto[];
}
