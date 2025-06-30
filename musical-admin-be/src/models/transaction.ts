import { Schema, model, Model, Document } from 'mongoose';

const { ObjectId } = Schema.Types;

export enum TransactionStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
    CANCELLED = 'CANCELLED',
}

export enum TransactionType {
    SUBSCRIPTION = 'SUBSCRIPTION',
}

export enum PaymentMethod {
    CRYPTO = 'Crypto',
    CARD = 'Card',
    BANK = 'Bank',
    WALLET = 'Wallet',
}

export interface TransactionDoc extends Document {
    amount: number;
    subtotal?: { cents?: number };
    fees?: { cents?: number };
    gasFees?: { cents?: number };
    total?: { cents?: number };
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

interface TransactionModel extends Model<TransactionDoc> {
    getById(id: string, projection?: any): Promise<TransactionDoc | null>;
    getByCustomer(customer: string): Promise<TransactionDoc[]>;
}

const TransactionSchema = new Schema<TransactionDoc>(
    {
        amount: { type: Number, required: true },
        subtotal: { type: Object },
        fees: { type: Object },
        gasFees: { type: Object },
        total: { type: Object },
        subscription: {
            customer: { type: String },
            merchant: { type: String },
            plan: {
                amount: {
                    cents: { type: Number },
                    currency: { type: String },
                },
                merchant: { type: String },
                name: { type: String },
                code: { type: String },
                interval: { type: String },
                description: { type: String },
                active: { type: Boolean },
            },
            fundingMethod: { type: String, enum: Object.values(PaymentMethod) },
            reference: { type: String },
            nextPaymentAt: { type: Date },
            status: { type: String },
            createdAt: { type: Date },
            updatedAt: { type: Date },
        },
    },
    {
        autoIndex: true,
        versionKey: false,
        timestamps: true,
    }
);

export const Transaction = model<TransactionDoc, TransactionModel>('Transaction', TransactionSchema);