import { ApiProperty } from '@nestjs/swagger';

export class SkillLevelsResponseDto {
  @ApiProperty({
    description: 'The level skill ID.',
  })
  _id: string;

  @ApiProperty({
    description: 'The title of the level skill',
    example: 'Bassist',
  })
  title: string;
}
