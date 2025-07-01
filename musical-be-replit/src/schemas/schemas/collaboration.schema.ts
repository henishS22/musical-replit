import * as mongoose from 'mongoose';

import { ObjectId } from 'mongodb';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SkillTypeDocument } from '.';

export type CollaborationDocument = Collaboration & Document;

@Schema({ timestamps: true })
export class Collaboration {
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  userId: string | null;

  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  })
  projectId: string | null;

  @Prop({ required: true })
  title: string;

  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track',
  })
  track: string | ObjectId | null;

  @Prop({ required: true })
  brief: string;

  @Prop({ required: false })
  artworkExtension: 'bmp' | 'jpeg' | 'png';

  @Prop({ required: false })
  artworkUrl: string;

  @Prop({
    required: true,
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'skill_type' }],
  })
  seeking: string[] | SkillTypeDocument[];

  @Prop({
    required: true,
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'skill_type' }],
  })
  skillsOffered: string[] | SkillTypeDocument[];

  @Prop({
    required: true,
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'styles' }],
  })
  styles: string[] | SkillTypeDocument[];
}

export const CollaborationSchema = SchemaFactory.createForClass(Collaboration);
