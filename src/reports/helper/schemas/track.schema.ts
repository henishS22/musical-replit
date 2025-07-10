import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';

export type TrackDocument = Track & Document;

@Schema({ timestamps: true })
export class Track {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  extension: 'wav' | 'mp3' | 'm4a' | 'mp4' | 'avi' | 'zip' | 'ptx';

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  user_id: string | ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId /* ref: 'Project' */ })
  project_id?: string | ObjectId;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill_types' }],
  })
  instrument: ObjectId[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId /* ref: 'Genre' */ }] })
  genre: ObjectId[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId /* ref: 'Tag' */ }] })
  tags?: ObjectId[];

  @Prop()
  size: number;

  @Prop()
  duration: number;

  @Prop()
  album?: string;

  @Prop()
  rating?: number;

  @Prop()
  rate?: number;

  @Prop()
  bitrate?: number;

  @Prop()
  BPM?: number;

  @Prop()
  resolution?: number;

  @Prop()
  version?: number;

  @Prop()
  dateCreated: Date;

  @Prop()
  url: string;

  @Prop()
  imageWaveSmall?: string;

  @Prop()
  imageWaveBig?: string;

  @Prop()
  createdAt: Date;
}

export const TrackSchema = SchemaFactory.createForClass(Track);
