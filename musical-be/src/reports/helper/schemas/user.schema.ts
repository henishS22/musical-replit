import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Style } from './style.schema';
import { CityDocument } from './city.schema';
import { SkillType } from '.';
import { SkillLevel } from './skillLevel.schema';
import { RolesEnum } from '../utils/enums';
import { ObjectId } from 'mongodb';

export type UserDocument = User & Document;

export class Device {
  os: {
    name: string;
    version: string;
  };

  client: {
    type: string;
    name: string;
  };
}

@Schema({ timestamps: true })
export class User {
  // Required props
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  birthday: Date;

  @Prop({ required: false })
  genre: number;

  // Description props
  @Prop({ unique: true, sparse: true })
  tag: string;

  @Prop()
  descr: string;

  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: 'City' })
  city: string | CityDocument;

  @Prop()
  profile_type: 0 | 1;

  @Prop()
  clb_setup: string;

  // Images props
  @Prop()
  profile_img: string;

  @Prop({
    type: [
      {
        type: { type: mongoose.Schema.Types.ObjectId, ref: 'skill_type' },
        level: { type: mongoose.Schema.Types.ObjectId, ref: 'skill_level' },
      },
    ],
  })
  skills: {
    type: mongoose.Schema.Types.ObjectId | SkillType;
    level: mongoose.Schema.Types.ObjectId | SkillLevel;
  }[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Style' }],
  })
  preferredStyles: ObjectId[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Style' }] })
  styles: Style[];

  // Social links
  @Prop()
  spotify: string;

  @Prop()
  apple_music: string;

  @Prop()
  youtube: string;

  @Prop()
  instagram: string;

  @Prop()
  tiktok: string;

  @Prop()
  twitter: string;

  @Prop()
  invited?: string;

  @Prop({
    required: false,
    type: Device,
  })
  registerDevice: Device;

  @Prop({
    required: false,
    type: [mongoose.Schema.Types.String],
    enum: RolesEnum,
    default: [RolesEnum.USER],
  })
  roles?: RolesEnum[];

  @Prop()
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
