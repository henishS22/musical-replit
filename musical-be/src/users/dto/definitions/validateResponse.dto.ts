import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ValidateResponseDto {
  @ApiProperty({
    description: 'The user ID',
  })
  id: string;

  @ApiProperty({
    description: 'The user email',
  })
  email: string;

  @ApiProperty({
    description: 'The user name',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'The generated JWT token',
  })
  jwt?: string;
}
