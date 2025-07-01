import { IsString } from 'class-validator';

export class DeleteLyricsDto {
  @IsString()
  id: string;

  @IsString()
  owner: string;
}
