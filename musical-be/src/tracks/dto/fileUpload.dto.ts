import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';


export class FileUploadDTO {
    @IsNotEmpty()
    @IsString()
    contentType: string;

    @IsBoolean()
    @IsOptional()
    isLocal?: boolean

    @IsNotEmpty()
    @IsString()
    extension: string;
}
