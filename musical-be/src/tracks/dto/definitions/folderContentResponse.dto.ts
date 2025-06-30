import { ApiProperty } from '@nestjs/swagger';

export class FolderContentResponse {
  @ApiProperty({
    description: 'Is a folder',
  })
  isFolder: boolean;
}
