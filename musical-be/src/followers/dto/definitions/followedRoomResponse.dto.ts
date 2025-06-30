import { ApiProperty } from '@nestjs/swagger';

class RoomDto {
  @ApiProperty({
    description: 'The room name',
  })
  room_name: string;

  @ApiProperty({
    description: 'The room url',
  })
  room_url: string;
}

export class FollowedRoomResponseDto {
  @ApiProperty({
    description: 'The room ID',
  })
  id: string;

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

  @ApiProperty({
    description: 'The user genre',
  })
  gender: string;

  @ApiProperty({
    description: 'The user rooms',
    type: [RoomDto],
  })
  rooms: RoomDto[];
}
