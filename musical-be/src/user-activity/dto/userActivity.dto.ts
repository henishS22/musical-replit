import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { EventDetailsDto } from './event.dto';

export class UserActivityDto {
    @IsNotEmpty()
    @IsString()
    _id?: string;

    @IsNotEmpty()
    @IsString()
    eventName?: string;

    @IsNotEmpty()
    @IsString()
    eventId?: string;

    @IsNotEmpty()
    @IsNumber()
    points?: number;

    @IsNotEmpty()
    @IsNumber()
    occurrence?: number;

    @IsNotEmpty()
    @IsNumber()
    maxOccurrence?: number;

    @IsNotEmpty()
    @IsString()
    userId?: string;

    @IsDateString()
    createdAt?: string;

    @IsDateString()
    updatedAt?: string;

    @IsNumber()
    @IsOptional()
    __v?: number;

    @ValidateNested()
    @Type(() => EventDetailsDto)
    eventDetails?: EventDetailsDto;
}
