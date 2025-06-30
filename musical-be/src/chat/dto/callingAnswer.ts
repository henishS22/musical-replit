import { IsBoolean, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCallingAnswer {
  @ApiProperty({
    description: 'The user ID that is calling',
  })
  @IsString()
  user_target: string;

  @ApiProperty({
    description: 'Indicates if the calling was accepted or not',
  })
  @IsBoolean()
  accepted: boolean;
}
