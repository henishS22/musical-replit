import { LyricsResponseDto } from '@/src/docs/dto/lyricsResponse.dto';
import { SkillsTypesResponseDto } from '@/src/docs/dto/skillsTypesResponse.dto';
import { UserResponseDto } from '@/src/docs/dto/userResponse.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FolderResponseDto } from './folderResponse.dto';
import { TagResponseDto } from './tagResponse.dto';

export class TrackResponseDto {
  @ApiProperty({
    description: 'The track ID',
  })
  _id: string;

  @ApiProperty({
    description: 'The track name',
  })
  name: string;

  @ApiProperty({
    description: 'The track extension',
    enum: ['wav', 'mp3', 'm4a', 'mp4', 'avi', 'zip', 'ptx'],
  })
  extension: 'wav' | 'mp3' | 'm4a' | 'mp4' | 'avi' | 'zip' | 'ptx';

  @ApiProperty({
    description: 'The track user',
    type: UserResponseDto,
  })
  user: UserResponseDto;

  @ApiProperty({
    description: 'The track folder',
    type: FolderResponseDto,
  })
  folder: FolderResponseDto;

  @ApiProperty({
    description: 'The track used skills',
    type: [SkillsTypesResponseDto],
  })
  instrument: SkillsTypesResponseDto[];

  @ApiProperty({
    description: 'The tags of the track',
    type: [TagResponseDto],
  })
  tags: TagResponseDto[];

  @ApiProperty({
    description: 'The track size',
  })
  size: number;

  @ApiProperty({
    description: 'The track duration',
  })
  duration: number;

  @ApiProperty({
    description: 'The track channels',
  })
  channels: number;

  @ApiProperty({
    description: 'The track album',
  })
  album: string;

  @ApiPropertyOptional({
    description: 'The track lyrics',
    type: LyricsResponseDto,
  })
  lyrics?: LyricsResponseDto;

  @ApiProperty({
    description: 'The track comments',
  })
  comments: string;

  @ApiProperty({
    description: 'The track rating',
  })
  rating: number;

  @ApiProperty({
    description: 'The track rate',
  })
  rate: number;

  @ApiProperty({
    description: 'The track bitrate',
  })
  bitrate: number;

  @ApiProperty({
    description: 'The track bpm',
  })
  BPM: number;

  @ApiProperty({
    description: 'The video resolution',
  })
  resolution: number;

  @ApiProperty({
    description: 'The track version',
  })
  version: number;

  @ApiProperty({
    description: 'Created at',
  })
  dateCreated: Date;

  @ApiProperty({
    description: 'Track URL',
  })
  url: string;

  @ApiPropertyOptional({
    description: 'The track small waveform',
  })
  imageWaveSmall: string;

  @ApiPropertyOptional({
    description: 'The track big waveform',
  })
  imageWaveBig: string;

  @ApiPropertyOptional({
    description: 'Flag if track is favorite',
  })
  favorite: boolean;
}
