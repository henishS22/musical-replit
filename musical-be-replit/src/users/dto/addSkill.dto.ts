import { IsNotEmpty, IsString } from 'class-validator';

export class AddSkillDto {
  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  level: string;
}
