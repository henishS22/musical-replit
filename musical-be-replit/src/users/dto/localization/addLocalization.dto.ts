import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddLocalizationDto {
  @ApiProperty({
    description: 'The city ID',
  })
  @IsNotEmpty()
  @IsString()
  cityId: string;
}
