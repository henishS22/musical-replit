import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CollaboratorReq {
    @IsNotEmpty()
    @IsString()
    projectId: string;

    @IsNotEmpty()
    @IsString()
    fromUserId: string;

    @IsNotEmpty()
    @IsString()
    toUserId: string;
}
