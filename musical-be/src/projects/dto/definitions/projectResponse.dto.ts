import { UserResponseDto } from '@/src/docs/dto/userResponse.dto';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectUpdateEnum } from '../../utils/enums';
import { ReleaseResponseDto } from './releaseResponse.dto';
import { TrackResponseDto } from './trackResponse.dto';

export class ProjectUpdateInfoDto {
  @ApiProperty({
    description: 'The comment. Present on COMMENT type',
    required: false,
  })
  comment?: string;

  @ApiProperty({
    description: 'The old name. Present on RENAME types',
    required: false,
  })
  oldName?: string;

  @ApiProperty({
    description: 'The new name. Present on RENAME types',
    required: false,
  })
  newName?: string;

  @ApiProperty({
    description: 'The tracks. Present on ADD_TRACKS and REMOVE_TRACKS types',
    required: false,
  })
  tracks?: TrackResponseDto;
}

export class ProjectUpdateDto {
  @ApiProperty({
    description: 'The release',
    type: ReleaseResponseDto,
  })
  release: ReleaseResponseDto;

  @ApiProperty({
    description: 'The type of update',
    enum: ProjectUpdateEnum,
  })
  type: ProjectUpdateEnum;

  @ApiProperty({
    description: 'The info of the update',
    type: ProjectUpdateInfoDto,
  })
  info: ProjectUpdateInfoDto;

  @ApiProperty({
    description: 'The user that made the update',
    type: UserResponseDto,
  })
  user: UserResponseDto;

  @ApiProperty({
    description: 'The date of the update',
  })
  createdAt: Date;
}

export class ProjectResponseDto {
  @ApiProperty({
    description: 'The project ID',
  })
  _id: string;

  @ApiProperty({
    description: 'The project name',
  })
  name: string;

  @ApiProperty({
    description: 'The project timeline updates',
    type: [ProjectUpdateDto],
    required: false,
  })
  updates: ProjectUpdateDto[];
}
