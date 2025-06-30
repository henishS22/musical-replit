import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class EventDetailsDto {
    @IsNotEmpty()
    @IsString()
    _id?: string;

    @IsNotEmpty()
    @IsString()
    name?: string;

    @IsNotEmpty()
    @IsString()
    identifier?: string;

    @IsNotEmpty()
    @IsNumber()
    points?: number;

    @IsNotEmpty()
    @IsNumber()
    occurrence?: number;

    @IsNotEmpty()
    @IsBoolean()
    isActive?: boolean;

    @IsNotEmpty()
    @IsString()
    createdById?: string;

    @IsNotEmpty()
    @IsString()
    updatedById?: string;

    @IsDateString()
    createdAt?: string;

    @IsDateString()
    updatedAt?: string;
}
