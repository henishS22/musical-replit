import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CountryName } from '../utils/types';

export type CountryDocument = Country & Document;

@Schema({ timestamps: true })
export class Country {
  @Prop({ required: true, type: CountryName })
  name: CountryName;
}

export const CountrySchema = SchemaFactory.createForClass(Country);
