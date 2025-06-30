import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class GetAllFromUserDto {
  @ApiProperty({
    description: 'View state of the notifications',
    enum: ['ALL', 'SEEN', 'NOT_SEEN'],
    required: false,
    default: 'ALL',
  })
  @IsOptional()
  viewed: 'ALL' | 'SEEN' | 'NOT_SEEN';
}
