import {
    IsArray,
    IsBoolean,
    IsIn,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    IsUrl,
    ValidateNested,
    ValidateIf,
    IsNumber,
    Min,
    Max,
} from 'class-validator';
import { Type } from 'class-transformer';

const platformOptions = [
    'facebook',
    'instagram',
    'instagram_landscape',
    'instagram_portrait',
    'instagram_special',
    'linkedin',
    'pinterest',
    'tiktok',
    'twitter',
];

const watermarkPositions = [
    'north',
    'northeast',
    'east',
    'southeast',
    'south',
    'southwest',
    'west',
    'northwest',
    'center',
];

const colorOptions = ['grayscale', 'sepia', 'invert'];

export class DimensionsDto {
    @IsNotEmpty()
    @IsNumber()
    width: number;

    @IsNotEmpty()
    @IsNumber()
    height: number;

    @IsOptional()
    @IsNumber()
    xCoordinate?: number;

    @IsOptional()
    @IsNumber()
    yCoordinate?: number;
}

export class WatermarkDto {
    @IsNotEmpty()
    @IsUrl({ require_tld: false }, { message: 'Watermark URL must start with https://' })
    url: string;

    @IsOptional()
    @IsIn(watermarkPositions, { message: 'Invalid watermark position' })
    position?: string;
}

export class EffectsDto {
    @IsOptional()
    @IsString()
    @IsIn(colorOptions, { message: 'Color must be grayscale, sepia, or invert' })
    color?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    opacity?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    quality?: number;
}

export class ResizePostDto {
    @ValidateIf(o => !o.file)
    @IsNotEmpty({ message: 'Image URL is required if file is not provided' })
    @IsUrl({ require_tld: false }, { message: 'mediaUrl must be a valid https URL' })
    mediaUrl?: string;

    @ValidateIf(o => !o.dimensions)
    @IsNotEmpty({ message: 'Platform is required if dimensions are not provided' })
    @IsIn(platformOptions, { each: true, message: 'Invalid platform' })
    platform?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => WatermarkDto)
    watermark?: WatermarkDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => EffectsDto)
    effects?: EffectsDto;

    @ValidateIf(o => !o.platform)
    @IsNotEmpty({ message: 'Dimensions are required if platform is not provided' })
    @ValidateNested()
    @Type(() => DimensionsDto)
    dimensions?: DimensionsDto;

    @IsOptional()
    @IsString()
    @IsIn(['resize', 'crop', 'blur'], { message: 'Mode must be resize, crop, or blur' })
    mode?: string = 'resize';

    @IsOptional()
    @IsBoolean()
    convertToJpg?: boolean;

    @IsOptional()
    @IsBoolean()
    convertToWebP?: boolean;
}


export class SentimentsDto {
    @IsNotEmpty()
    text: string;
}

export class TranscribeVideoDto {
    @IsNotEmpty()
    url: string;

    @IsNotEmpty()
    file: string;

    @IsNotEmpty()
    extension: string;
}