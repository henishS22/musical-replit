import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';

export type TrackCommentDocument = TrackComment & Document;

interface DurationObject {
  from: number;
  to: number;
}
interface CommentObject {
  comment: string;
  commentedAt: Date;
  user_id: ObjectId;
}

@Schema({ timestamps: true })
export class TrackComment {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  user_id: string | ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Tracks' })
  track_id: string | ObjectId;

  @Prop({
    type: {
      from: Number,
      to: Number,
    },
    _id: false,
  })
  duration: DurationObject;

  @Prop({ required: true, default: false })
  isResolved: boolean;

  @Prop([
    {
      comment: { type: String, required: true },
      commentedAt: { type: Date, default: Date.now },
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
      },
    },
  ])
  comments: CommentObject[];
}

export const TrackCommentSchema = SchemaFactory.createForClass(TrackComment);
