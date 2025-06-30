import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { CountryDocument } from './country.schema';

export type StateDocument = State & Document;

@Schema({ timestamps: true })
export class State {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country',
  })
  countryId: string | CountryDocument;

  @Prop({ required: true })
  name: string;
}

export const StateSchema = SchemaFactory.createForClass(State);
