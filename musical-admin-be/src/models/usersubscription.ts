import { Schema, model, Model, Document } from 'mongoose';
import { BaseModel } from '@core/database';

const { ObjectId } = Schema.Types;

export enum UserSubscriptionStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export interface FeatureUsage {
    featureKey: string;
    usage?: number | string;
    limit?: number | string;
    unit?: number | string;
}

export interface Coinflow {
    paymentId: number;
    customerId: string;
    subscriptionId: string;
    planId: string;
    isCanceled: boolean;
    wallet: string;
}

export interface UserSubscriptionDoc extends BaseModel, Document {
    userId: string | typeof ObjectId;
    subscriptionId: string | typeof ObjectId;
    name?: string;
    planCode?: string;
    startDate?: Date;
    endDate?: Date;
    type: 'subscription' | 'addon';
    subscriptionInterval?: string; // Monthly, Yearly, Lifetime
    billingCycle?: string | null; // Monthly, Yearly, null for lifetime plan
    nextBillingDate?: Date | null; // null for lifetime plan
    status: UserSubscriptionStatus;
    usage: FeatureUsage[];
    coinflow?: Coinflow;
}

interface UserSubscriptionModel extends Model<UserSubscriptionDoc> {
    getById(id: string, projection?: any): Promise<UserSubscriptionDoc | null>;
    getByUserId(userId: string): Promise<UserSubscriptionDoc[]>;
}

const UserSubscriptionSchema = new Schema<UserSubscriptionDoc>(
    {
        userId: { type: ObjectId, required: true, ref: 'User' },
        subscriptionId: { type: ObjectId, required: true, ref: 'Subscription' },
        name: { type: String },
        planCode: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        type: { type: String, enum: ['subscription', 'addon'], required: true },
        subscriptionInterval: { type: String },
        billingCycle: { type: String, default: null },
        nextBillingDate: { type: Date, default: null },
        status: { type: String, enum: Object.values(UserSubscriptionStatus), required: true },
        usage: { type: [{ featureKey: String, usage: Schema.Types.Mixed, limit: Schema.Types.Mixed, unit: Schema.Types.Mixed }], required: true },
        coinflow: {
            type: {
                paymentId: Number,
                customerId: String,
                subscriptionId: String,
                planId: String,
                isCanceled: Boolean,
                wallet: String,
            },
            default: null,
        },
    },
    {
        autoIndex: true,
        versionKey: false,
        timestamps: true,
    }
);

export const UserSubscription = model<UserSubscriptionDoc, UserSubscriptionModel>('UserSubscription', UserSubscriptionSchema);