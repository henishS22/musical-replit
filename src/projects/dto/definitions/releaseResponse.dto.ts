import { ApiProperty } from '@nestjs/swagger';
import { TrackResponseDto } from './trackResponse.dto';
import { UserResponseDto } from '@/src/docs/dto/userResponse.dto';

export class ContractDto {
  @ApiProperty({
    description: 'The contract user',
    type: UserResponseDto,
  })
  user: UserResponseDto;

  @ApiProperty({
    description: 'The contract split',
  })
  split: number;

  @ApiProperty({
    description: 'Indicates if the contract was accepted',
  })
  accepted: boolean;

  @ApiProperty({
    description: 'The user wallet address',
  })
  address?: string;
}

export class ReleaseResponseDto {
  @ApiProperty({
    description: 'The release ID',
  })
  _id: string;

  @ApiProperty({
    description: 'The release name',
  })
  name: string;

  @ApiProperty({
    description: 'The release tracks',
    type: [TrackResponseDto],
  })
  selectedTracks: TrackResponseDto[];

  @ApiProperty({
    description: 'The release final versions',
    type: [TrackResponseDto],
  })
  finalVersions: TrackResponseDto[];

  @ApiProperty({
    description: 'The release contracts',
    type: [ContractDto],
    required: false,
  })
  contracts: ContractDto[];
}
