import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';
import { ForeignKeyField } from '../utils/types';
import { Lyrics } from './lyrics.schema';

export type TrackDocument = Track & Document;

@Schema({ timestamps: true })
export class Track {
  @Prop({ required: true })
  name: string;

  @Prop()
  extension: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  user_id: string | ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Metadata' })
  metadata_id: string | ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId /* ref: 'Folder' */ })
  folder_id: string | ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId /* ref: 'Project' */ })
  project_id: string | ObjectId;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill_types' }],
  })
  instrument: ObjectId[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId /* ref: 'Genre' */ }] })
  genre: ObjectId[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId /* ref: 'Tag' */ }] })
  tags: ObjectId[];

  @Prop()
  size: number;

  @Prop()
  duration: number;

  @Prop()
  channels: number;

  @Prop()
  album: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, /* ref: 'Lyrics' */ })
  lyrics?: string | ObjectId;

  // @Prop({
  //   type: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'Lyrics',
  //   },
  // })
  // lyrics?: string | ObjectId;

  @Prop()
  comments: string;

  @Prop()
  rating: number;

  @Prop()
  rate: number;

  @Prop()
  bitrate: number;

  @Prop()
  BPM: number;

  @Prop()
  resolution: number;

  @Prop()
  version: number;

  @Prop()
  dateCreated: Date;

  @Prop()
  url: string;

  @Prop()
  imageWaveSmall: string;

  @Prop()
  imageWaveBig: string;

  @Prop()
  favorite: boolean;

  @Prop({ isRequired: false })
  previewStart: number;

  @Prop({ isRequired: false })
  previewEnd: number;

  @Prop({ isRequired: false })
  previewExtension: string;

  @Prop()
  artworkExtension: string;

  @Prop()
  artwork: string;

  @Prop({ default: false, })
  isAIGenerated: boolean;
}

export const TrackSchema = SchemaFactory.createForClass(Track);
