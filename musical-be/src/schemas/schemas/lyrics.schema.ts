import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';

export type LyricsDocument = Lyrics & Document;

export class LyricsLineWordChord {
  chord: string;

  lineIndex: number;

  position: number;
}

export class LyricsLineWord {
  text?: string;

  chords: LyricsLineWordChord[];
}

export class LyricsLine {
  words: LyricsLineWord[];
}

@Schema({ timestamps: true })
export class Lyrics {

  @Prop({ required: true })
  title: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  user_id: string | ObjectId;

  @Prop({ required: true })
  lines: string;

  // @Prop({ required: true })
  // lines: LyricsLine[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Projects' })
  project_id: string | ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Tracks' })
  track_id: string | ObjectId;
}

export const LyricsSchema = SchemaFactory.createForClass(Lyrics);
