import { ApiProperty } from '@nestjs/swagger';

export class TrackResponseDto {
  @ApiProperty({
    description: 'The track ID',
  })
  _id: string;

  @ApiProperty({
    description: 'The track name',
  })
  name: string;
}
