import { IsBoolean, IsOptional } from 'class-validator';

export class updateApplication {
  @IsOptional()
  @IsBoolean()
  isFavorite: boolean;

  @IsOptional()
  @IsBoolean()
  isArchived: boolean;

  @IsOptional()
  @IsBoolean()
  isApproved: boolean;
}
