import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { StateDocument } from './state.schema';

export type CityDocument = City & Document;

@Schema({ timestamps: true })
export class City {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'State',
  })
  stateId: string | StateDocument;

  @Prop({ required: true })
  name: string;
}

export const CitySchema = SchemaFactory.createForClass(City);
