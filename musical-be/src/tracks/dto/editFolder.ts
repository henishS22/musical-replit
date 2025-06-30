import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EditFolder {
  // Required props
  @ApiProperty({
    description: 'The name of the folder',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
