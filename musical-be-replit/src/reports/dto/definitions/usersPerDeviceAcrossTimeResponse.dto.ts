import { ApiProperty } from '@nestjs/swagger';

export class DevicesDtoResponse {
  @ApiProperty({
    description: 'Android total users',
  })
  android: number;

  @ApiProperty({
    description: 'iOS total users',
  })
  ios: number;

  @ApiProperty({
    description: 'Web total users',
  })
  web: number;
}

export class UsersPerDeviceAcrossTimeResponseDto {
  @ApiProperty({
    description: 'The date of the register',
  })
  date: string;

  @ApiProperty({
    description: 'The number of registers by device',
    type: DevicesDtoResponse,
  })
  devices: DevicesDtoResponse;
}
