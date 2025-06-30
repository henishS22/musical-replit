import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Style } from './style.schema';
import { CityDocument } from './city.schema';
import { SkillType } from '.';
import { SkillLevel } from './skillLevel.schema';
import { Provider, RolesEnum } from '../utils/types';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export class Wallet {
  @Prop({ required: true, unique: true })
  addr: string;

  @Prop({ required: true, type: mongoose.Schema.Types.String })
  provider: Provider;
}
export class PushToken {
  _id: mongoose.Types.ObjectId;

  token: string;

  createdAt: Date;
}

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
  @Prop({ required: false })
  name: string;

  @Prop({ required: false, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ default: false })
  isBanned: boolean;

  @Prop()
  emailVerified: boolean;

  @Prop()
  birthday: Date;

  @Prop({ required: false })
  genre: number;

  //Pass prop
  @Prop()
  password: string;

  // Description props
  @Prop({ unique: true, sparse: true })
  tag: string;

  @Prop()
  descr: string;

  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: 'City' })
  city: string | CityDocument;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'skill_type' }],
  })
  clb_interest: ObjectId[];

  @Prop()
  clb_availability_items: {
    order: number;
    title: string;
    description: string;
  }[];

  @Prop()
  clb_availability: string;

  @Prop()
  profile_type: 0 | 1;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Style' }],
  })
  clb_setup: ObjectId[];

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

  @Prop()
  cover_img: string;

  // Crypto props
  @Prop()
  wallet: string;

  @Prop()
  wallets: Wallet[];

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
  confirmEmailToken?: string;

  @Prop()
  invited?: string;

  @Prop({
    required: false,
    type: PushToken,
  })
  pushTokens?: PushToken[];

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

  @Prop({
    type: {
      profileCreated: { type: Boolean, default: false },
      profile: {
        profileKey: { type: String, required: true },
        refId: { type: String, required: true },
        title: { type: String, required: true },
        tag: { type: String, required: false },
      },
    },
    required: false,
  })
  ayrshare: {
    profileCreated: boolean;
    profile: {
      profileKey: string;
      refId: string;
      title: string;
      tag?: string;
    };
  };

  @Prop({
    required: false,
    default: false,
  })
  isDistroApproved: boolean;

  @Prop()
  chartmetricId: number;

  @Prop({ required: false })
  firstTimeLogin: boolean;

  @Prop({ required: false, default: false })
  loginFlag: boolean;

  @Prop()
  mobile: string;

  @Prop()
  countryCode: string;

  @Prop({ required: false, default: false })
  isCoinflowUser: boolean;

  @Prop({
    type: {
      code: { type: String, required: true },
      expireIn: { type: Date, required: true },
    },
    required: false,
  })
  otp: {
    code: string;
    expireIn: Date
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.virtual('tracks', {
  ref: 'tracks',
  localField: '_id',
  foreignField: 'user_id',
});
