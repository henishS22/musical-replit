import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type SubscriptionDocument = Subscription & Document;

export class Features {
  featureKey: string;
  description: string;
  available?: boolean;
  limit?: number | string;
  unit?: string;
  limitExist?: boolean;
}

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ required: false })
  coinflowPlanId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  planCode: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: ['subscription', 'addon'] })
  type: string;

  @Prop({ required: true, default: true })
  isOnCoinflow: boolean;

  @Prop({ required: true, default: false })
  isFree: boolean;

  @Prop({ required: true })
  price: number;

  @Prop({ required: false, default: 'USD' })
  currency: string;

  @Prop({ required: true, enum: ['Monthly', 'Yearly', 'Lifetime'] })
  interval: string;

  @Prop({ required: false })
  duration: number;

  @Prop({
    required: false,
    type: Features,
  })
  features: Features[];

  @Prop({ required: true, enum: ['active', 'deactivated'] })
  status: string;

  @Prop({ required: true })
  createdById: mongoose.Schema.Types.ObjectId;

  @Prop({ required: false })
  isDeleted: boolean;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
