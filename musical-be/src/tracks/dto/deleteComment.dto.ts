import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class DeleteCommentDto {
  @ApiPropertyOptional({
    description: 'The track comment ID',
  })
  @IsOptional()
  @IsString()
  track_comment_id: string;

  @ApiPropertyOptional({
    description: 'The comment ID',
  })
  @IsOptional()
  @IsString()
  comment_id: string;
}
