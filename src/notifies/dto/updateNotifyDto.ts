import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateNotifyDto {
  @ApiProperty({
    description: 'View state of the notification',
    required: false,
  })
  @IsOptional()
  viewed: boolean;
}
