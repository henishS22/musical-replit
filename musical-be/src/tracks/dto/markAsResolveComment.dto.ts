import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class MarkAsResolveCommentDto {
  @ApiPropertyOptional({
    description: 'The track comment ID',
  })
  @IsOptional()
  @IsString()
  track_comment_id: string;
}
