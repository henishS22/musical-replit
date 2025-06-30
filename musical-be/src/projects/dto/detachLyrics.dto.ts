import { IsMongoId } from 'class-validator';

export class DetachLyricsDto {
  @IsMongoId()
  lyricsId: string;

  @IsMongoId()
  owner: string;
}
