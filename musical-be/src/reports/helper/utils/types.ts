import { Prop } from '@nestjs/mongoose';

import * as mongoose from 'mongoose';

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

export class CountryName {
  @Prop({ required: true })
  english: string;

  @Prop({ required: true })
  native: string;
}

export type Localization = {
  country: { name: string };
  state: { name: string };
  city: { name: string };
};

export type ForeignKeyField<T> = string | mongoose.Schema.Types.ObjectId | T;

export interface IMockPayload {
  value: string | object;
}
