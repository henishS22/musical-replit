import { ApiProperty } from '@nestjs/swagger';

export class FollowResponseDto {
  @ApiProperty({
    description: 'The followed ID',
  })
  followed: string;

  @ApiProperty({
    description: 'The follower ID',
  })
  follower: string;
}
