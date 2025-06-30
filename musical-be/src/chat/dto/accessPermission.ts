import { IsString } from 'class-validator';

export class getAccessPermission {
  @IsString()
  user_id: string;

  @IsString()
  user_target: string;

  @IsString()
  room_name: string;
}
