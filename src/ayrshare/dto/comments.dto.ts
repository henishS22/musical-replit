import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class PostCommentDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  comment: string;

  @IsOptional()
  @IsBoolean()
  searchPlatformId: boolean;

  @IsNotEmpty()
  @IsArray()
  @IsIn(
    [
      'facebook',
      'instagram',
      'linkedin',
      'reddit',
      'tiktok',
      'twitter',
      'youtube',
    ],
    { each: true, message: 'Invalid platform specified.' },
  )
  platforms: string[];
}

export class DeleteCommentDto {
  @IsNotEmpty()
  @IsArray()
  @IsIn(
    [
      'facebook',
      'instagram',
      'linkedin',
      'reddit',
      'tiktok',
      'twitter',
      'youtube',
    ],
    { each: true, message: 'Invalid platform specified.' },
  )
  platforms: string[];
}

export class ReplyToCommentDto {
  @IsNotEmpty()
  @IsArray()
  @IsIn(['facebook', 'instagram', 'linkedin', 'tiktok', 'twitter', 'youtube'], {
    each: true,
    message: 'Invalid platform specified.',
  })
  platforms: string[];

  @IsNotEmpty()
  @IsString()
  comment: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true, message: 'Each media URL must be a valid URL' })
  mediaUrls?: string[];
}
