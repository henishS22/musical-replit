import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { IsAfterOrEqual } from '../validators/IsAfterOrEqual';

export class PostedCollaborationsPerUserAcrossTimeDto {
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

  @ApiProperty({
    description: 'Group by',
    enum: ['day', 'month', 'year'],
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(['day', 'month', 'year'])
  groupBy: 'day' | 'month' | 'year';
}
