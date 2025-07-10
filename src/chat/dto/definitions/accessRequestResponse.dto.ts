import { ApiProperty } from '@nestjs/swagger';

export class AccessRequestResponseDto {
  @ApiProperty({
    description: 'The room owner',
  })
  user_target: object;

  @ApiProperty({
    description: 'The user ID that wants to enter the room',
  })
  user_id: object;

  @ApiProperty({
    description: 'The room name',
  })
  room_name: string;
}
