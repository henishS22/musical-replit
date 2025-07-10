import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindUserByEmailDto {
  @ApiProperty({
    description: 'The user email',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
