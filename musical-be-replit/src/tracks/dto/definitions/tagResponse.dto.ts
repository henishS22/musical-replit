import { ApiProperty } from '@nestjs/swagger';

export class TagResponseDto {
  @ApiProperty({
    description: 'The tag ID.',
  })
  _id: string;

  @ApiProperty({
    description: 'The title of the tag',
  })
  title: string;
}
