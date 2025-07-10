import { ApiProperty } from '@nestjs/swagger';

export class UploadedFilesPerUserAcrossTimeResponseDto {
  @ApiProperty({
    description: 'The date of the creation',
  })
  date: string;

  @ApiProperty({
    description: 'The number of uploaded files',
  })
  total: number;

  @ApiProperty({
    description: 'The number of users at the date',
  })
  totalUsers: number;

  @ApiProperty({
    description: 'The average number of uploaded files per user',
  })
  average: number;
}
