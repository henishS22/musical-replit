import { IsString, IsOptional, IsNotEmpty, IsBoolean, IsNumber } from 'class-validator';

export class ProfileConnectDTO {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsString()
  questId: string;
}

export class InstaConnectDTO {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsString()
  post: string;

  @IsNotEmpty()
  @IsString()
  questId: string;
}

export class PostDTO {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsString()
  creatorQuestId: string;
}

export class EmailDTO {

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  questId: string;
}

export class TextDTO {
  @IsNotEmpty()
  @IsString()
  mobile: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  countryCode: string;

  @IsNotEmpty()
  @IsString()
  questId: string;
}
