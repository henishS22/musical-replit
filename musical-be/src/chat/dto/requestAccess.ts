import { IsString } from 'class-validator';
import { ObjectId } from 'mongodb';

export class RequestAccessRoom {
  @IsString()
  user_id: string | ObjectId;

  @IsString()
  room_name: string;
}
