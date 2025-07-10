import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class LinkToProjectDto {
  @ApiProperty({
    description: 'Tracks IDs',
  })
  @IsNotEmpty()
  @IsArray()
  trackIds: string[];
}
