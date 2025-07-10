import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class OtpDto {
    @IsNotEmpty()
    @IsString()
    countryCode: string;

    @IsNotEmpty()
    @IsString()
    mobile: string;
}
