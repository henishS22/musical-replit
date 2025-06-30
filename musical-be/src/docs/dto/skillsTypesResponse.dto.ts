import { ApiProperty } from '@nestjs/swagger';

export class SkillsTypesResponseDto {
  @ApiProperty({
    description: 'The type skill ID.',
  })
  _id: string;

  @ApiProperty({
    description: 'The title of the type skill',
    example: 'Bassist',
  })
  title: string;
}
