import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class createChannelDto {
  // Required props
  @IsOptional()
  @IsString()
  channelName: string;

  @IsOptional()
  @IsString()
  channelId: string;

  @IsOptional()
  @IsString()
  image: string;

  @IsNotEmpty()
  team: string[];

  @IsNotEmpty()
  type: string;
}
