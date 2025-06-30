import { ApiProperty } from '@nestjs/swagger';

export class CreatedProjectsResponseDto {
  @ApiProperty({
    description: 'Total projects created',
  })
  total: number;

  @ApiProperty({
    description: 'Total public projects created',
  })
  public: number;

  @ApiProperty({
    description: 'Total private projects created',
  })
  private: number;
}
