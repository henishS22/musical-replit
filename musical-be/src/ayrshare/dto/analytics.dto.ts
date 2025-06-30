import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class PostAnalyticsDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsArray()
  @IsIn(
    [
      'instagram',
      'facebook',
      'linkedin',
      'pinterest',
      'reddit',
      'tiktok',
      'twitter',
      'youtube',
    ],
    { each: true, message: 'Invalid platform specified' },
  )
  platforms: string[];
}

export class SocialNetworkAnalyticsDto {
  @IsNotEmpty()
  @IsArray()
  @IsIn(
    [
      'instagram',
      'facebook',
      'linkedin',
      'pinterest',
      'reddit',
      'tiktok',
      'twitter',
      'youtube',
    ],
    { each: true, message: 'Invalid platform specified' },
  )
  platforms: string[];

  @IsOptional()
  @IsNumber()
  quarters?: number;

  @IsOptional()
  @IsBoolean()
  daily?: boolean;
}
