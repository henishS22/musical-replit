import { IsBoolean, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccessAnswer {
  @ApiProperty({
    description: 'The user ID that wants to enter the room',
  })
  @IsString()
  user_target: string;

  @ApiProperty({
    description: 'The name of the room',
  })
  @IsString()
  room_name: string;

  @IsString()
  user_id: string;

  @ApiProperty({
    description: 'Indicates if the the user was accepted to enter the room',
  })
  @IsBoolean()
  accepted: boolean;
}
