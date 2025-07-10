import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCallingDto {
  @ApiProperty({
    description: 'The user ID that you want to call',
  })
  @IsString()
  user_target: string;

  @IsString()
  @IsOptional()
  user_id: string;

  @ApiProperty({
    description:
      'Indicates if the first time you call the user, be careful with this indication, once it can cause inconsistency in the front end',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  first_ask: boolean;
}
