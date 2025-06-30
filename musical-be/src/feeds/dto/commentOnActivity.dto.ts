import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CommentOnActivityDto {
  @ApiProperty({
    description: 'The comment text',
  })
  @IsString()
  @IsNotEmpty()
  comment: string;
}
