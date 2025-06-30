import * as mongoose from 'mongoose';

import { ObjectId } from 'mongodb';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SkillTypeDocument } from './skillsType.schema';
import { Style } from './style.schema';

export type CollaborationDocument = Collaboration & Document;

@Schema({ timestamps: true })
export class Collaboration {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track',
  })
  track: string | ObjectId;

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
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Style.name }],
  })
  styles: string[] | SkillTypeDocument[];

  @Prop({
    required: false,
  })
  isDeleted?: boolean;
}

export const CollaborationSchema = SchemaFactory.createForClass(Collaboration);
