import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty } from 'class-validator';
import { IsAfterOrEqual } from '../validators/IsAfterOrEqual';

export class PostedCollaborationsDto {
  @ApiProperty({
    description: 'Start date',
  })
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  startAt: Date;

  @ApiProperty({
    description: 'End date',
  })
  @IsNotEmpty()
  @IsDate()
  @IsAfterOrEqual('startAt')
  @Transform(({ value }) => new Date(value))
  endAt: Date;
}
