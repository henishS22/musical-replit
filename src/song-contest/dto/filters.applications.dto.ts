import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class applicationFilters {
  @ApiProperty({
    description: 'Boolean value for the tab filters',
  })
  @IsOptional()
  @IsString({ each: true })
  tabFilter: string;
}
