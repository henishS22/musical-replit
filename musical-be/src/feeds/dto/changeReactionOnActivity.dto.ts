import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReactionsTypes } from '../utils/enums';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeReactionOnActivityDto {
  @ApiProperty({
    description:
      'Type of reaction. If null or empty, the reaction will be removed',
    enum: ReactionsTypes,
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsEnum(ReactionsTypes)
  type?: ReactionsTypes;
}
