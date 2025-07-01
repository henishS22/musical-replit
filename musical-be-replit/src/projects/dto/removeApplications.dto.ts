import { IsNotEmpty, IsArray, IsString } from 'class-validator';

export class RemoveApplicationsDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsArray()
  applicationIds: string[];
}
