import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaMongoose } from 'mongoose';

export type TrackProjectDocument = TrackProject & Document;

@Schema({ timestamps: true })
export class TrackProject {
  @Prop({
    required: true,
    type: SchemaMongoose.Types.ObjectId,
    ref: 'Tracks',
    index: true,
  })
  trackId: string | SchemaMongoose.Types.ObjectId;

  @Prop({
    required: true,
    type: SchemaMongoose.Types.ObjectId,
    ref: 'Projects',
    index: true,
  })
  projectId: string | SchemaMongoose.Types.ObjectId;

  @Prop()
  createdAt: Date;
}

export const TrackProjectSchema = SchemaFactory.createForClass(TrackProject);
