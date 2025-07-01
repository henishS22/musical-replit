import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'The user ID',
  })
  _id: string;

  @ApiProperty({
    description: 'The user name',
  })
  name: string;

  @ApiProperty({
    description: 'The user profile image',
  })
  profile_img: string;
}
