import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateMemberDto {
  @IsNotEmpty()
  @IsString()
  accountType: string;

  @IsNotEmpty()
  @IsString()
  id: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  metadata?: object;
}

export class ConnectedAccountDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  accountType: string;
}

export class TrackEventDto {
  @IsNotEmpty()
  @IsString()
  eventType: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ConnectedAccountDto)
  connectedAccount: ConnectedAccountDto;
}
