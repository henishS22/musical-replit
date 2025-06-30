import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class FirstCommentDto {
  @IsString()
  @IsNotEmpty({ message: 'First comment cannot be empty' })
  comment: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true, message: 'Each media URL must be a valid URL' })
  mediaUrls?: string[];
}

export class AutoHashtagDto {
  @IsOptional()
  @IsString()
  position?: 'auto' | 'end';

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Max hashtags must be at least 1' })
  @Max(5, { message: 'Max hashtags cannot be more than 5' })
  max?: number;
}

export class YouTubeOptionsDto {
  @IsNotEmpty()
  @IsString()
  title: string

  @IsOptional()
  @IsString()
  visibility: string

  @IsOptional()
  @IsString()
  thumbNail: string

  @IsOptional()
  @IsArray()
  tags: Array<String>
}

export class PublishPostDto {
  @IsNotEmpty({ message: 'Post content can not be empty' })
  @IsString()
  post: string;

  @IsNotEmpty()
  @IsArray()
  @IsIn(
    [
      'facebook',
      'twitter',
      'linkedin',
      'instagram',
      'youtube',
      'reddit',
      'telegram',
      'gmb',
      'pinterest',
      'tiktok',
      'all',
    ],
    { each: true, message: 'Invalid platform specified' },
  )
  platforms: string[];

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true, message: 'Each media URL must be a valid URL' })
  mediaUrls?: string[];

  @IsOptional()
  @IsBoolean()
  isVideo?: boolean;

  @IsOptional()
  @IsISO8601(
    {},
    { message: 'Schedule date must be a valid ISO 8601 date string' },
  )
  scheduleDate?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => YouTubeOptionsDto)
  youTubeOptions: YouTubeOptionsDto

  @IsOptional()
  blueskyOptions: object

  @IsOptional()
  faceBookOptions: object

  @IsOptional()
  gmbOptions: object

  @IsOptional()
  instagramOptions: object

  @IsOptional()
  linkedInOptions: object

  @IsOptional()
  pinterestOptions: object

  @IsOptional()
  redditOptions: object

  @IsOptional()
  telegramOptions: object

  @IsOptional()
  tikTokOptions: object

  @IsOptional()
  twitterOptions: object

  @IsOptional()
  @ValidateNested()
  @Type(() => FirstCommentDto)
  firstComment?: FirstCommentDto;

  @IsOptional()
  @IsBoolean()
  disableComments?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => AutoHashtagDto)
  autoHashtag?: AutoHashtagDto;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class GetScheduledPostsDto {
  @ApiPropertyOptional({
    description: 'Start date filter for scheduled posts (ISO format)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date filter for scheduled posts (ISO format)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class HistoryQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  lastDays?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  platform?: string;
}