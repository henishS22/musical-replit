import { IsNotEmpty, IsString } from 'class-validator';

export class SavedSongContestDto {
  @IsNotEmpty()
  @IsString()
  songContestId: string;
}
