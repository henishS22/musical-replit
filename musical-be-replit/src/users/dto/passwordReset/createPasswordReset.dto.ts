import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePasswordResetDto {
  @ApiProperty({
    description: 'The user email',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
