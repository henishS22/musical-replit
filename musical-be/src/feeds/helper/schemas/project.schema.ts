import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';
import { Collaborator } from '../utils/types';

export type ProjectDocument = Project & mongoose.Document;

@Schema()
export class Project {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: string | User;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  artworkExension: 'bmp' | 'jpeg' | 'png';

  @Prop({ required: false })
  artworkUrl: string;

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

  @Prop({ required: false })
  deadline: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
