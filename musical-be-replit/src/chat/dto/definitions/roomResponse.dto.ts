import { ApiProperty } from '@nestjs/swagger';

export class RoomResponseDto {
  @ApiProperty({
    description: 'The room ID',
  })
  room_id: string;

  @ApiProperty({
    description: 'The *unique* room name',
  })
  room_name: string;

  @ApiProperty({
    description: 'The *unique* room url',
  })
  room_url: string;

  @ApiProperty({
    description: 'Indicates if the room is public or not',
  })
  privacy: boolean;

  @ApiProperty()
  exp: string;

  @ApiProperty({
    description: 'The user id of the room owner',
  })
  user_id: string;

  @ApiProperty({
    description:
      'The token permission of the owner user, this attribute is hidden if session.user != user id of the room owner',
  })
  token: string;

  @ApiProperty({
    description:
      'Users that required to access the room *This attribute is not used yet*',
  })
  user_request_access: string;
}
