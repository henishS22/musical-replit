import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class DeviceOSDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  version: string;
}

export class DeviceClientDto {
  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}

export class DeviceDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => DeviceOSDto)
  os: DeviceOSDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => DeviceClientDto)
  client: DeviceClientDto;
}
