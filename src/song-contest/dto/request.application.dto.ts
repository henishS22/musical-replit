import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RequestApplicationDto {
  @IsNotEmpty()
  @IsString()
  songContestId: string;

  @IsNotEmpty()
  @IsString()
  brief: string;

  @IsNotEmpty()
  @IsArray()
  files: string[];

  @IsArray()
  @IsOptional()
  links: string[];
}
