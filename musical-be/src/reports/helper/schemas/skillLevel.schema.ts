import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { I18nDocument } from '../utils/types';

export type SkillLevelDocument = SkillLevel & Document;

@Schema()
export class SkillLevel {
  @Prop({ required: true, type: I18nDocument })
  title: I18nDocument;

  @Prop()
  level: string;
}

export const SkillLevelSchema = SchemaFactory.createForClass(SkillLevel);
