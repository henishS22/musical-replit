import { ApiProperty } from '@nestjs/swagger';

class GroupResult {
  @ApiProperty({
    description: 'Total',
  })
  total: number;

  @ApiProperty({
    description: 'Average',
  })
  average: number;
}

export class AverageUploadedFilesResponseDto {
  @ApiProperty({
    description: 'General',
    type: GroupResult,
  })
  general: GroupResult;

  @ApiProperty({
    description: 'Audio',
    type: GroupResult,
  })
  audio: GroupResult;

  @ApiProperty({
    description: 'Video',
    type: GroupResult,
  })
  video: GroupResult;

  @ApiProperty({
    description: 'Other',
    type: GroupResult,
  })
  other: GroupResult;
}
