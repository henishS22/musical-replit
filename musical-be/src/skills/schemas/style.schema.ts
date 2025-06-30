import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { I18nDocument } from '../utils/types';

export type StyleDocument = Style & Document;

@Schema({ timestamps: true })
export class Style {
  @Prop({ required: true })
  style: string;

  // Required props
  @Prop({ required: true, type: I18nDocument })
  title: I18nDocument;
}

export const StyleSchema = SchemaFactory.createForClass(Style);
