import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type SavedSongContestDocument = SavedSongContest & Document;
@Schema()
export class SavedSongContest {
  @Prop({ required: true })
  songContestId: string;

  @Prop({ required: true })
  userId: string;
}
export const SavedSongContestSchema =
  SchemaFactory.createForClass(SavedSongContest);
