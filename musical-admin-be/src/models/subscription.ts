import { Schema, model, Document } from 'mongoose';
import { BaseModel } from '@core/database';

const { ObjectId } = Schema.Types;

export interface Feature {
  featureKey: string;
  description: string;
  not_available_description?: string;
  available?: boolean;
  limit?: number | string;
  unit?: string;
}

export interface SubscriptionAttrs {
  coinflowPlanId: string;
  name: string;
  planCode: string;
  description: string;
  type: string;
  price: number;
  interval: string;
  duration?: number;
  currency: string;
  features?: Feature[];
  status: string;
  createdById: typeof ObjectId;
  updatedById?: typeof ObjectId;
}

export interface SubscriptionDoc extends BaseModel, Document {
  id: typeof ObjectId;
  coinflowPlanId: string;
  name: string;
  planCode: string;
  description: string;
  type: string;
  price: number;
  interval: string;
  duration?: number;
  currency: string;
  features: Feature[];
  status: string;
  isDeleted: boolean;
  createdById: typeof ObjectId;
  updatedById?: typeof ObjectId;
}

const FeatureSchema = new Schema({
  featureKey: { type: String, required: true },
  description: { type: String, required: true },
  not_available_description: { type: String },
  available: { type: Boolean, default: true },
  limit: { type: Schema.Types.Mixed },
  unit: { type: String }
});

const SubscriptionSchema = new Schema<SubscriptionDoc>(
  {
    coinflowPlanId: { type: String, required: false },
    name: { type: String, required: true },
    planCode: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true, enum: ['subscription', 'addon'] },
    price: { type: Number, required: true },
    interval: { type: String, required: true, enum: ['Monthly', 'Yearly', 'Lifetime'] },
    duration: { type: Number },
    currency: { type: String, required: true, default: 'USD' },
    features: [FeatureSchema],
    status: { type: String, required: true, enum: ['active', 'deactivated'] },
    createdById: { type: ObjectId, ref: 'User', required: true },
    updatedById: {type: ObjectId, ref: 'User'},
    isDeleted: { type: Boolean, default: false },
  },
  {
    autoIndex: true,
    versionKey: false,
    timestamps: true,
  }
);

export const Subscription = model<SubscriptionDoc>('Subscription', SubscriptionSchema);