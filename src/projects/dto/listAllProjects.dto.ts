import { IsArray, IsOptional } from 'class-validator';

export class ListAllProjectsDto {
  @IsArray()
  @IsOptional()
  genreIds: string[];

  @IsArray()
  @IsOptional()
  instrumentIds: string[];
}
