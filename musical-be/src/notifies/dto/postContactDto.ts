import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PostContactDto {
  @ApiProperty({
    description: 'First name',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'Last name',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'Company name',
  })
  @IsString()
  company: string;

  @ApiProperty({
    description: 'Email',
  })
  @IsString()
  email: string;

  @ApiProperty({
    description: 'Contact topic',
  })
  @IsString()
  topic: string;

  @ApiProperty({
    description: 'Contact message',
  })
  @IsString()
  message: string;
}
