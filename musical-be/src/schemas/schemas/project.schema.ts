import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { UserDocument } from '.';
import {
  ProjectUpdateEnum,
  SplitModelEnum,
  TypeCollaboratorEnum,
} from '../utils/enums';
import { Collaborator, ForeignKeyField } from '../utils/types';
import { Lyrics } from './lyrics.schema';
import { Release } from './release.schema';
import { Track } from './track.schema';
import { ObjectId } from 'mongodb';

export type ProjectDocument = Project & Document;

class Info {
  comment?: string;
  oldName?: string;
  newName?: string;
  tracks?: ForeignKeyField<Track>[];
}

export class ProjectUpdate {
  release: ForeignKeyField<Release>;
  type: ProjectUpdateEnum;
  info: Info;
  user: ForeignKeyField<UserDocument>;
  createdAt: Date;
}

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: string | UserDocument;

  @Prop({
    required: false,
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'collabRoles',
  })
  ownerRoles: (string | mongoose.Schema.Types.ObjectId)[];

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  artworkExension: 'bmp' | 'jpeg' | 'png';

  @Prop({ required: false })
  artworkUrl: string;

  @Prop({ required: true, enum: SplitModelEnum })
  splitModel: string;

  @Prop({ required: false })
  split?: number;

  @Prop({ required: true, enum: TypeCollaboratorEnum })
  type: string;

  @Prop({ required: false, type: [Object] })
  collaborators: Collaborator[];

  @Prop({ required: false })
  youtube: string;

  @Prop({ required: false })
  spotify: string;

  @Prop({ required: false })
  coverExtension: 'bmp' | 'jpeg' | 'png';

  @Prop({ required: false })
  coverImageUrl: string;

  @Prop({ required: false, default: false })
  isPublic: boolean;

  @Prop({ required: false, type: [Object] })
  updates?: ProjectUpdate[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, /* ref: 'Lyrics' */ })
  lyrics?: string | ObjectId;
  // @Prop({
  //   type: [
  //     {
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: 'Lyrics',
  //     },
  //   ],
  // })
  // lyrics?: ForeignKeyField<Lyrics>[];

  @Prop({ required: false })
  deadline: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
