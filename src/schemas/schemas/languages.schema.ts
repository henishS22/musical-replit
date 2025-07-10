import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type LanguageDocument = Language & Document;

@Schema({ timestamps: true })
export class Language {
  @Prop()
  title: string;

  @Prop()
  language: string;
}

export const LanguageSchema = SchemaFactory.createForClass(Language);
