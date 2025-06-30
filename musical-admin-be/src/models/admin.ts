import { Role } from '@core/constants/roles'
import { BaseModel } from '@core/database'
import { App } from '@core/globals'
import { GenerateRandomNumberOfLength, GenerateRandomStringOfLength } from '@core/utils'
import { Password } from '@helpers/password'
import { Document, model, Model, Schema } from 'mongoose'
const { ObjectId } = Schema.Types

export interface UserInput {
    username: string
    walletAddress?: string
    roleId: typeof ObjectId
    isVerified: boolean
}

export interface AdminInput {
    fullName?: string
    email?: string
    mobile: string
    countryCode: string
    roleId: typeof ObjectId
}

interface AdminAttrs extends UserInput {
    accountTypeCode: Role
}

interface AdminAttrs extends AdminInput {
    accountTypeCode: Role
}

export interface AdminSchemaDoc extends AdminDoc {
    createVerificationCode: (codeType: string) => Promise<void>
    deleteVerificationCode: (codeType: string) => Promise<void>
    create2FACode: () => Promise<void>
    create2FACodeSuperAdmin: () => Promise<void>
    delete2FACode: () => Promise<void>
    createGoogleAuthVerificationCode: (data) => Promise<void>
    createGoogleAuthCode: (code: string) => Promise<void>
    deleteGoogleAuthCode: () => Promise<void>
    createResetPasswordCode: () => Promise<void>
    deleteResetPasswordCode: () => Promise<void>
    createForgotPasswordCode: () => Promise<void>
    deleteForgotPasswordCode: () => Promise<void>
}
export interface AdminModel extends Model<AdminSchemaDoc> {
    build(attrs: AdminAttrs | AdminAttrs): AdminDoc
    getById(value: string, projection: any): AdminDoc
    getByEmail(email: string): AdminDoc
}

export interface AdminDoc extends BaseModel, Document {
    _id: typeof ObjectId
    username?: string
    fullName?: string
    walletAddress?: string
    email?: string
    emailVerifiedAt?: Date
    countryCode?: string
    mobile?: string
    mobileVerifiedAt?: Date
    password?: string
    passwordChangedAt?: Date
    permissions?: number[]
    totalCollections?: number,
    isEmailVerified?: boolean
    roleId: typeof ObjectId
    totalVolume?: number
    floorPrice?: number
    verification?: {
        codeType: string
        referenceCode: string
        code: string
    }[]
    FCMToken?: string[]
    accountTypeCode: Role
    profilePic?: string
    coverPic?: string
    description?: string
    socialLinks?: {
        facebook?: string
        twitter?: string
        instagram?: string
        blog?: string
        website?: string
        discord?: string
    }
    notificationSetting: {
        itemSold: boolean
        bidActivity: boolean
        priceChange: boolean
        outbid: boolean
        itemBought: boolean
        newsletter: boolean
    }
    isPublic: string
    tags?: string[]
    isFirstLogin?: boolean
    isProfileDetailsUpdated?: boolean
    isQrGenerated?: boolean
    followingCount?: number
    followerCount?: number
    isVerified?: boolean
    isVerifiedFromBlockchain?: boolean
    isActive: boolean
    isCollectionAccess: boolean
    isRequestedCollectionAccess: boolean
    collectionAccessStatus: string
    rejectReason: string
    address: string
    isBlocked: boolean
    isBanned: boolean
    signature: string
    data: string
    reason: string
    isWhitelisted: boolean
    isRequestForwhitelist: boolean
}

const AdminSchema = new Schema<AdminSchemaDoc>(
    {
        username: { type: String, unique: true, sparse: true },
        fullName: { type: String },
        walletAddress: String,
        email: { type: String, unique: true, sparse: true },
        emailVerifiedAt: Date,
        isEmailVerified: { type: Boolean, default: false },
        countryCode: { type: String },
        mobile: { type: String, unique: true, sparse: true },
        mobileVerifiedAt: Date,
        password: { type: String, select: false },
        passwordChangedAt: { type: Date },
        permissions: [Number],
        totalCollections: { type: Number, default: 0 },
        roleId: { type: ObjectId, ref: 'Role' },
        totalVolume: { type: Number, default: 0 },
        floorPrice: { type: Number, default: 0 },
        verification: {
            type: [
                {
                    codeType: {
                        type: String,
                        enum: ['forgotPassword', 'resetPassword', 'twoFA', null],
                    },
                    referenceCode: String,
                    code: String,
                },
            ],
            _id: false,
            select: false,
        },
        FCMToken: [String],
        accountTypeCode: {
            type: String,
            default: Role.USER,
            enum: [Role.USER, Role.SUPER_ADMIN, Role.ADMIN],
        },
        profilePic: { type: String },
        coverPic: { type: String },
        description: { type: String },
        socialLinks: {
            type: {
                facebook: String,
                twitter: String,
                instagram: String,
                blog: String,
                website: String,
                discord: String,
            },
            default: {
                facebook: '',
                twitter: '',
                instagram: '',
                blog: '',
                website: '',
            },
            _id: false,
        },
        notificationSetting: {
            itemSold: {
                type: Boolean,
                default: true,
            },
            bidActivity: {
                type: Boolean,
                default: true,
            },
            priceChange: {
                type: Boolean,
                default: true,
            },
            outbid: {
                type: Boolean,
                default: true,
            },
            itemBought: {
                type: Boolean,
                default: true,
            },
            newsletter: {
                type: Boolean,
                default: true,
            },
        },
        isPublic: { type: String, default: 'public', enum: ['public', 'private'] },
        tags: [String],
        signature: { type: String },
        data: { type: String },
        reason: { type: String },
        isFirstLogin: { type: Boolean, default: true },
        isProfileDetailsUpdated: { type: Boolean, default: false },
        isQrGenerated: { type: Boolean, default: false },
        followingCount: { type: Number, default: 0 },
        followerCount: { type: Number, default: 0 },
        isVerified: { type: Boolean, default: false },
        isVerifiedFromBlockchain: { type: Boolean, default: false },
        isBlocked: { type: Boolean, default: false },
        isBanned: { type: Boolean, default: false },
        isDeleted: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        createdById: { type: ObjectId, ref: 'Admin' },
        updatedById: { type: ObjectId, ref: 'Admin' },
        isCollectionAccess: { type: Boolean, default: false },
        collectionAccessStatus: { type: String, default: "pending" },
        rejectReason: { type: String },
        address: { type: String },
        isRequestedCollectionAccess: { type: Boolean, default: false },
        isWhitelisted: { type: Boolean, default: false },
        isRequestForwhitelist: { type: Boolean, default: false }
    },
    {
        autoIndex: true,
        versionKey: false,
        timestamps: true,
    }

)


// Before Save Hook
AdminSchema.pre('save', async function (done) {
    if (this.isModified('password')) {
        const hashed = await Password.toHash(this.get('password'))
        this.set('password', hashed)
        this.set('passwordChangedAt', new Date())
    }
    done()
})

// Static Methods
//  Create Validation Codes
AdminSchema.methods.createVerificationCode = async function (codeType: string): Promise<void> {
    await this.verification.push({
        codeType: codeType,
        code: GenerateRandomNumberOfLength(4),
        referenceCode: GenerateRandomStringOfLength(10),
    })
}
AdminSchema.methods.createVerificationCodeSuperAdmin = async function (
    codeType: string
): Promise<void> {
    await this.verification.push({
        codeType: codeType,
        //For QA testing it's static for present
        code: '123456',
        // code: GenerateRandomNumberOfLength(6),
        referenceCode: GenerateRandomStringOfLength(10),
    })
}
// Nullify verification
AdminSchema.methods.deleteVerificationCode = async function (codeType: string): Promise<void> {
    await this.verification.pull({ 'verification.codeType': codeType })
    await this.save()
}

// Create 2FA code
AdminSchema.methods.create2FACode = async function (): Promise<AdminDoc> {
    await this.delete2FACode()
    await this.createVerificationCode('twoFA')
    return this
}

// Create 2FA code
AdminSchema.methods.create2FACodeSuperAdmin = async function (): Promise<AdminDoc> {
    await this.delete2FACode()
    await this.createVerificationCodeSuperAdmin('twoFA')
    return this
}
// Nullify 2FA code
AdminSchema.methods.delete2FACode = async function (): Promise<void> {
    await this.deleteVerificationCode('twoFA')
}

// Function to create a new User
AdminSchema.statics.build = async (attrs: AdminAttrs | AdminAttrs) => {
    const admin = new Admin(attrs)
    await admin.save()
    return admin
}

// Function to get document by id
AdminSchema.statics.getById = async (value: string, projection = {}) => {
    return App.Models.User.findOne({ _id: value }, projection)
}

// Function to get document by email
AdminSchema.statics.getByEmail = async (email: string) => {
    return App.Models.User.findOne({ email })
}

// Create Reset Password code
AdminSchema.methods.createResetPasswordCode = async function (): Promise<void> {
    await this.deleteResetPasswordCode()
    await this.createVerificationCode('resetPassword')
}

// Nullify Reset Password code
AdminSchema.methods.deleteResetPasswordCode = async function (): Promise<void> {
    await this.deleteVerificationCode('resetPassword')
}

// Create Forgot Password code
AdminSchema.methods.createForgotPasswordCode = async function (): Promise<void> {
    await this.deleteResetPasswordCode()
    await this.createVerificationCode('forgotPassword')
}

// Nullify Forgot Password code
AdminSchema.methods.deleteForgotPasswordCode = async function (): Promise<void> {
    await this.deleteVerificationCode('forgotPassword')
}

export const Admin = model<AdminSchemaDoc, AdminModel>('Admin', AdminSchema)
