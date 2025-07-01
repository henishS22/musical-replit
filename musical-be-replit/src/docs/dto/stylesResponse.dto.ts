import { ApiProperty } from '@nestjs/swagger';

export class StylesResponseDto {
  @ApiProperty({
    description: 'The style ID.',
  })
  _id: string;

  @ApiProperty({
    description: 'The title of the style',
    example: 'Bassist',
  })
  title: string;
}
