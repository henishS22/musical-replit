import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindOneUserDto {
  @ApiProperty({
    description: 'The user ID',
  })
  @IsNotEmpty()
  @IsString()
  id: string;
}
