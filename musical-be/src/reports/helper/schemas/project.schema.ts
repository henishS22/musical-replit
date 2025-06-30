import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { User } from '.';
import { TypeCollaboratorEnum } from '../utils/enums';

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: string | User;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  artworkExension: 'bmp' | 'jpeg' | 'png';

  @Prop({ required: false })
  artworkUrl: string;

  @Prop({ required: true, enum: TypeCollaboratorEnum })
  type: string;

  @Prop({ required: false })
  coverExtension: 'bmp' | 'jpeg' | 'png';

  @Prop({ required: false })
  coverImageUrl: string;

  @Prop({ required: false, default: false })
  isPublic: boolean;

  @Prop()
  createdAt: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
