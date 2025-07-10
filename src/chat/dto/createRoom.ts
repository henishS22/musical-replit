import { IsNumber, IsString } from 'class-validator';
import { ObjectId } from 'mongodb';

export class CreateRoomDto {
  @IsString()
  user_id: string | ObjectId;

  @IsNumber()
  max_participants: number;
}
