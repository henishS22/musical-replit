import { ApiProperty } from '@nestjs/swagger';

export class CreatedProjectsPerUserAcrossTimeResponseDto {
  @ApiProperty({
    description: 'The date of the creation',
  })
  date: string;

  @ApiProperty({
    description: 'The number of created projects',
  })
  total: number;

  @ApiProperty({
    description: 'The number of users at the date',
  })
  totalUsers: number;

  @ApiProperty({
    description: 'The average number of created projects per user',
  })
  average: number;
}
