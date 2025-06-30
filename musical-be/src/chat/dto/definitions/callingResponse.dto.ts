import { UserResponseDto } from '@/src/docs/dto/userResponse.dto';
import { ApiProperty } from '@nestjs/swagger';
import { RoomResponseDto } from './roomResponse.dto';

export class CallingResponseDto {
  @ApiProperty({
    type: RoomResponseDto,
  })
  room: RoomResponseDto;

  @ApiProperty({
    type: Object,
    description: 'The user owner room information',
  })
  user: UserResponseDto;
}
