import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

type FolderType = 'subfolder' | 'root';

export class FolderResponseDto<T extends FolderType = null> {
  @ApiProperty({
    description: 'The folder ID',
  })
  _id: string;

  @ApiProperty({
    description: 'The folder name',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'The parent folder ID',
  })
  parent_id: T extends null ? string | null : T extends 'root' ? null : string;
}
