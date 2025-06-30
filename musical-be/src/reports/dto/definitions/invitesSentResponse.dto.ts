import { UserResponseDto } from '@/src/docs/dto/userResponse.dto';
import { ApiProperty } from '@nestjs/swagger';

export class InvitesSentResponseDto {
  @ApiProperty({
    description: 'The user that sent the invites',
    type: UserResponseDto,
  })
  user: UserResponseDto;

  @ApiProperty({
    description: 'The number of invites sent',
  })
  invites_sent: number;

  @ApiProperty({
    description: 'The number of invites accepted',
  })
  invites_used: number;
}
