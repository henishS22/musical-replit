import { Prop } from '@nestjs/mongoose';

export type SkillsObjectType = {
  skills_type_info: {
    _id: string;
    type: string;
    title: { [key: string]: string };
  }[];
  skills_level_info: {
    _id: string;
    level: string;
    title: { [key: string]: string };
  }[];
};

export class I18nDocument {
  @Prop()
  en: string;

  @Prop()
  es: string;
}
