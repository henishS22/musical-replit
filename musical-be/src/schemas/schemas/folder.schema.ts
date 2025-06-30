import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export type FolderDocument = Folder & Document;

@Schema({ timestamps: true })
export class Folder {
  @Prop({ required: true })
  name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user_id: string | ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'folder' })
  parent_id: string | ObjectId;
}

export const FolderSchema = SchemaFactory.createForClass(Folder);
