import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { I18nDocument } from '../utils/types';

export type SkillTypeDocument = SkillType & Document;

@Schema()
export class SkillType {
  @Prop({ required: true, type: I18nDocument })
  title: I18nDocument;

  @Prop()
  icon: string;
}

export const SkillTypeSchema = SchemaFactory.createForClass(SkillType);
