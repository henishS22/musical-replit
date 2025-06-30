import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export enum TransactionType {
  SUBSCRIPTION = 'subscription',
}

export enum PaymentMethod {
  CRYPTO = 'Crypto',
  CARD = 'Card',
  BANK = 'Bank',
  WALLET = 'Wallet',
}

@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ type: Number })
  amount: number;

  @Prop({ type: Object })
  subtotal?: {
    cents?: number;
  };

  @Prop({ type: Object })
  fees?: {
    cents?: number;
  };

  @Prop({ type: Object })
  gasFees?: {
    cents?: number;
  };

  @Prop({ type: Object })
  total?: {
    cents?: number;
  };

  @Prop({ type: Object })
  webhookInfo?: {
    userId?: string;
    planCode?: string;
    planId?: string;
  };

  @Prop({ type: Object })
  subscription?: {
    customer?: string;
    merchant?: string;
    plan?: {
      amount?: {
        cents?: number;
        currency?: string;
      };
      merchant?: string;
      name?: string;
      code?: string;
      interval?: string;
      description?: string;
      active?: boolean;
    };
    fundingMethod?: PaymentMethod;
    reference?: string;
    nextPaymentAt?: Date;
    status?: string;
    createdAt?: Date;
    updatedAt?: Date;
  };
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);