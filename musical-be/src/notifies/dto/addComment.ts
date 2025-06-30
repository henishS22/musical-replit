import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class AddCommentOnTrack {
    @IsNotEmpty()
    @IsString()
    projectId: string;

    @IsNotEmpty()
    @IsString()
    fromUserId: string;

    @IsNotEmpty()
    @IsString()
    toUserId: string;

    @IsNotEmpty()
    @IsBoolean()
    trackId: string;
}
