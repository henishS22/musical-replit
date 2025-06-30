import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

export type songContestApplicationsDocument = songContestApplications &
  Document;

@Schema({ timestamps: true })
export class songContestApplications {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  applicantId: string;

  @Prop({ required: true })
  brief: string;

  @Prop({
    required: true,
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'tracks' }],
  })
  tracks: string[];

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SongContest',
  })
  songContestId: string | ObjectId;

  @Prop({ required: false })
  links: string[];

  @Prop({ required: false, default: false })
  isFavorite: boolean;

  @Prop({ required: false, default: false })
  isArchived: boolean;

  @Prop({ required: false, default: false })
  isApproved: boolean;
}

export const SongContestApplicationSchema = SchemaFactory.createForClass(
  songContestApplications,
);
