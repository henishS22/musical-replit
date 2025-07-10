import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';
import * as mongoose from 'mongoose';
import { InviteStatusEnum } from '../utils/enums';
import { ForeignKeyField } from '../utils/types';

export type InviteDocument = Invite & Document;

@Schema({ timestamps: true })
export class Invite {
  @Prop({
    required: true,
    enum: InviteStatusEnum,
    type: mongoose.Schema.Types.String,
  })
  status: InviteStatusEnum;

  // Required props
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: ForeignKeyField<User>;
}

export const InviteSchema = SchemaFactory.createForClass(Invite);
