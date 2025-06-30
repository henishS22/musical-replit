import { ApiProperty } from '@nestjs/swagger';

export class PostedCollaborationsPerUserAcrossTimeResponseDto {
  @ApiProperty({
    description: 'The date of the creation',
  })
  date: string;

  @ApiProperty({
    description: 'The number of posted collaborations',
  })
  total: number;

  @ApiProperty({
    description: 'The number of users at the date',
  })
  totalUsers: number;

  @ApiProperty({
    description: 'The average number of posted collaborations per user',
  })
  average: number;
}
