import { Prop } from '@nestjs/mongoose';

import * as mongoose from 'mongoose';

//Defines file type for file upload
export type ImageFileType = {
  mimetype: 'image/bmp' | 'image/jpeg' | 'image/png';
  buffer: Buffer;
  size: number;
};

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

//Defines the image type to be used to transfer data between services
export type TransportImageType = {
  mimetype: 'image/bmp' | 'image/jpeg' | 'image/png';
  fileCacheKey: string;
  size: number;
};

export type ForeignKeyField<T> = string | mongoose.Schema.Types.ObjectId | T;

export type ArtistSearch = {
  query?: string;
  sort?: boolean;
  skills?: string[];
  styles?: string[];
  page?: number;
  limit?: number;
};

export interface IMockPayload {
  value: string | object;
}
