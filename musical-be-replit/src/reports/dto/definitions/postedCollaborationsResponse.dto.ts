import { ApiProperty } from '@nestjs/swagger';

export class PostedCollaborationsResponseDto {
  @ApiProperty({
    description: 'Total collaborations posted',
  })
  total: number;
}
