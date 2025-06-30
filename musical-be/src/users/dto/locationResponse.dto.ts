import { ApiProperty } from '@nestjs/swagger';

export class CityResponseDto {
  @ApiProperty({
    description: 'The city ID',
  })
  _id: string;

  @ApiProperty({
    description: 'The city name',
  })
  name: string;
}

export class StateResponseDto {
  @ApiProperty({
    description: 'The state ID',
  })
  _id: string;

  @ApiProperty({
    description: 'The state name',
  })
  name: string;
}

export class CountryResponseDto {
  @ApiProperty({
    description: 'The country ID',
  })
  _id: string;

  @ApiProperty({
    description: 'The country name',
  })
  name: string;
}

export class LocationResponseDto {
  @ApiProperty({
    description: 'The user city',
    type: CityResponseDto,
  })
  city: CityResponseDto;

  @ApiProperty({
    description: 'The user state',
    type: StateResponseDto,
  })
  state: StateResponseDto;

  @ApiProperty({
    description: 'The user country',
    type: CountryResponseDto,
  })
  country: CountryResponseDto;
}
