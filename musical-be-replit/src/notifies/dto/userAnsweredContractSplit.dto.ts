import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class UserAnsweredContractSplitDto {
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @IsNotEmpty()
  @IsString()
  releaseId: string;

  @IsNotEmpty()
  @IsString()
  fromUserId: string;

  @IsNotEmpty()
  @IsString()
  toUserId: string;

  @IsNotEmpty()
  @IsBoolean()
  accepted: string;
}
