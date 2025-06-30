import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';
import { CollaborateWithEnum, CollaborationTypeEnum } from '../utils/enums';

export type SongContestDocument = SongContest & Document;

@Schema({ timestamps: true })
export class SongContest {
  @Prop({
    required: true,
    enum: CollaborateWithEnum,
  })
  collaborateWith: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  userId: string | null;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  })
  projectId: string | null;

  @Prop({
    required: false,
    enum: CollaborationTypeEnum,
  })
  collaborationType: string | null;

  @Prop({
    required: true,
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'languages',
  })
  languages: (string | ObjectId)[] | null;

  @Prop({ required: true })
  title: string;

  @Prop({
    required: true,
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'tracks' }],
  })
  tracks: string[];

  @Prop({ required: true })
  brief: string;

  @Prop({
    required: false,
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'skill_type',
  })
  seeking: string[];

  // @Prop({
  //   required: true,
  //   type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'skill_type ' }],
  // })
  // skillsOffered: string[] | SkillTypeDocument[];

  @Prop({
    required: false,
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'styles' }],
  })
  styles: string[];

  @Prop({
    required: true,
    type: {
      startFrom: { type: Date, required: true },
      endTo: { type: Date, required: true },
    },
  })
  duration: { startFrom: Date; endTo: Date };

  @Prop({
    required: false,
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'design' }],
  })
  designs: string[] | null;
}

export const SongContestSchema = SchemaFactory.createForClass(SongContest);
