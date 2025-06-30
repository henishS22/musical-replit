import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { ForeignKeyField } from '../utils/types';
import { User, Subscription } from '.';

export type UserSubscriptionDocument = UserSubscription & Document;

export enum UserSubscriptionStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
}

export class FeatureUsage {
  featureKey: string;
  usage?: number | string;
  limit?: number | string;
  unit?: number | string;
}

@Schema({
  timestamps: true,
})
export class UserSubscription {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'users' })
  userId: ForeignKeyField<User>;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true,
  })
  subscriptionId: mongoose.Types.ObjectId;

  @Prop({ required: false })
  name: string;

  @Prop({ required: false })
  planCode: string;

  @Prop({ required: false })
  startDate: Date;

  @Prop({ required: false })
  endDate: Date;

  @Prop({ required: true, enum: ['subscription', 'addon'] })
  type: string;

  @Prop({ required: false })
  subscriptionInterval: string; // Monthly, Yearly, Lifetime

  @Prop({ required: false })
  billingCycle: string | null; // Monthly, Yearly, null for lifetime plan

  @Prop({ required: false })
  nextBillingDate: Date | null; // null for lifetime plan

  @Prop({ required: true, enum: UserSubscriptionStatus })
  status: UserSubscriptionStatus;

  @Prop({ required: true })
  usage: FeatureUsage[];

  @Prop({ type: Object })
  coinflow: {
    paymentId: number;
    customerId: string;
    subscriptionId: string;
    planId: string;
    isCanceled: boolean;
    wallet: string;
  };
}

export const UserSubscriptionSchema =
  SchemaFactory.createForClass(UserSubscription);
