import { App } from '@core/globals'
import { BaseModel } from '@core/database'
import { Schema, model, Model, Document } from 'mongoose'
const ObjectId = Schema.Types.ObjectId
import { Role } from '@core/constants/roles'
import { UserInput } from './admin'


export interface AdminInput {
	fullName?: string
	email?: string
	mobile: number
	countryCode: string
	roleId: typeof ObjectId
}

interface UserAttrs extends UserInput {
	accountTypeCode: Role
}
interface AdminAttrs extends AdminInput {
	accountTypeCode: Role
}
export interface UserModel extends Model<UserSchemaDoc> {
	build(attrs: UserAttrs | AdminAttrs): UserDoc
	getById(value: string, projection: any): UserDoc
	getByEmail(email: string): UserDoc
}
export interface UserSchemaDoc extends UserDoc {

}

export interface UserDoc extends BaseModel, Document {
	name: string
	email: string
	emailVerified?: boolean
	isDistroApproved?: boolean
	birthday?: Date
	genre?: number
	password?: string
	tag?: string
	descr?: string
	isBanned: boolean
	city?: string
	clb_interest?: string
	clb_availability_items?: {
		order: number
		title: string
		description: string
	}[]
	clb_availability?: string
	profile_type?: 0 | 1
	clb_setup?: string
	profile_img?: string
	cover_img?: string
	wallet?: string
	wallets?: {
		addr: string
		provider: string
	}[]
	skills?: {
		type: typeof ObjectId
		level: typeof ObjectId
	}[]
	preferredStyles?: typeof ObjectId[]
	styles?: typeof ObjectId[]
	social_links?: {
		spotify?: string
		apple_music?: string
		youtube?: string
		instagram?: string
		tiktok?: string
		twitter?: string
	}
	confirmEmailToken?: string
	invited?: string
	pushTokens?: {
		_id: typeof ObjectId
		token: string
		createdAt: Date
	}[]
	registerDevice?: {
		os: { name: string; version: string }
		client: { type: string; name: string }
	}
	roles?: string[]
	ayrshare?: {
		profileCreated: boolean
		profile: {
			profileKey: string
			refId: string
			title: string
			tag?: string
		}
	}
}

const UserSchema = new Schema<UserDoc>(
	{
		name: { type: String, required: true },
		email: { type: String, unique: true, required: true },
		emailVerified: { type: Boolean },
		birthday: { type: Date },
		genre: { type: Number },
		password: { type: String },
		tag: { type: String, unique: true, sparse: true },
		descr: { type: String },
		clb_interest: { type: String },
		clb_availability_items: [
			{
				order: Number,
				title: String,
				description: String,
			},
		],
		clb_availability: { type: String },
		profile_type: { type: Number, enum: [0, 1] },
		clb_setup: { type: String },
		profile_img: { type: String },
		cover_img: { type: String },
		wallet: { type: String },
		wallets: [
			{
				addr: { type: String, required: true },
				provider: { type: String, required: true },
			},
		],
		skills: [
			{
				type: { type: ObjectId, ref: 'skill_type' },
				level: { type: ObjectId, ref: 'skill_level' },
			},
		],
		preferredStyles: [{ type: ObjectId, ref: 'Style' }],
		styles: [{ type: ObjectId, ref: 'Style' }],
		social_links: {
			spotify: String,
			apple_music: String,
			youtube: String,
			instagram: String,
			tiktok: String,
			twitter: String,
		},
		confirmEmailToken: { type: String },
		invited: { type: String },
		pushTokens: [
			{
				_id: ObjectId,
				token: String,
				createdAt: Date,
			},
		],
		registerDevice: {
			os: {
				name: String,
				version: String,
			},
			client: {
				type: String,
				name: String,
			},
		},
		roles: [{ type: String, default: 'USER' }],
		isDistroApproved: { type: Boolean, default: false },
		isBanned: { type: Boolean, default: false },
		ayrshare: {
			profileCreated: { type: Boolean, default: false },
			profile: {
				profileKey: { type: String, required: true },
				refId: { type: String, required: true },
				title: { type: String, required: true },
				tag: { type: String },
			},
		},
	},
	{
		autoIndex: true,
		versionKey: false,
		timestamps: true,
	}
)



export const User = model<UserDoc, UserModel>('User', UserSchema)










// import { Role } from '@core/constants/roles'
// import { BaseModel } from '@core/database'
// import { App } from '@core/globals'
// import { GenerateRandomNumberOfLength, GenerateRandomStringOfLength } from '@core/utils'
// import { Password } from '@helpers/password'
// import { Document, model, Model, Schema } from 'mongoose'
// const { ObjectId } = Schema.Types

// export interface Wallet {
// 	addr: string
// 	provider: string
// }
// export interface UserInput {
// 	username: string
// 	wallets?: Wallet[]
// 	wallet: string
// 	roleId: typeof ObjectId
// 	isVerified: boolean
// }

// export interface AdminInput {
// 	fullName?: string
// 	email?: string
// 	mobile: number
// 	countryCode: string
// 	roleId: typeof ObjectId
// }

// interface UserAttrs extends UserInput {
// 	accountTypeCode: Role
// }

// interface AdminAttrs extends AdminInput {
// 	accountTypeCode: Role
// }

// export interface UserSchemaDoc extends UserDoc {
// 	createVerificationCode: (codeType: string) => Promise<void>
// 	deleteVerificationCode: (codeType: string) => Promise<void>
// 	create2FACode: () => Promise<void>
// 	create2FACodeSuperAdmin: () => Promise<void>
// 	delete2FACode: () => Promise<void>
// 	createGoogleAuthVerificationCode: (data) => Promise<void>
// 	createGoogleAuthCode: (code: string) => Promise<void>
// 	deleteGoogleAuthCode: () => Promise<void>
// 	createResetPasswordCode: () => Promise<void>
// 	deleteResetPasswordCode: () => Promise<void>
// 	createForgotPasswordCode: () => Promise<void>
// 	deleteForgotPasswordCode: () => Promise<void>
// }
// export interface UserModel extends Model<UserSchemaDoc> {
// 	build(attrs: UserAttrs | AdminAttrs): UserDoc
// 	getById(value: string, projection: any): UserDoc
// 	getByEmail(email: string): UserDoc
// }

// export interface UserDoc extends BaseModel, Document {
// 	_id: typeof ObjectId
// 	name?: string
// 	fullName: string
// 	wallets?: Wallet[]
// 	wallet?: string
// 	email?: string
// 	emailVerifiedAt?: Date
// 	countryCode?: string
// 	mobile?: string
// 	mobileVerifiedAt?: Date
// 	password?: string
// 	passwordChangedAt?: Date
// 	permissions?: number[]
// 	totalCollections?: number,
// 	isEmailVerified?: boolean
// 	roleId: typeof ObjectId
// 	totalVolume?: number
// 	floorPrice?: number
// 	verification?: {
// 		codeType: string
// 		referenceCode: string
// 		code: string
// 	}[]
// 	FCMToken?: string[]
// 	accountTypeCode: Role
// 	profilePic?: string
// 	coverPic?: string
// 	profile_img?: string
// 	description?: string
// 	socialLinks?: {
// 		facebook?: string
// 		twitter?: string
// 		instagram?: string
// 		blog?: string
// 		website?: string
// 		discord?: string
// 	}
// 	notificationSetting: {
// 		itemSold: boolean
// 		bidActivity: boolean
// 		priceChange: boolean
// 		outbid: boolean
// 		itemBought: boolean
// 		newsletter: boolean
// 	}
// 	isPublic: string
// 	tags?: string[]
// 	isFirstLogin?: boolean
// 	isProfileDetailsUpdated?: boolean
// 	isQrGenerated?: boolean
// 	followingCount?: number
// 	followerCount?: number
// 	isVerified?: boolean
// 	isVerifiedFromBlockchain?: boolean
// 	isActive: boolean
// 	roles: Role
// 	isCollectionAccess: boolean
// 	isRequestedCollectionAccess: boolean
// 	collectionAccessStatus: string
// 	rejectReason: string
// 	address: string
// 	isBlocked: boolean
// 	isBanned: boolean
// 	signature: string
// 	data: string
// 	reason: string
// 	isWhitelisted: boolean
// 	isRequestForwhitelist: boolean
// 	totalProject?: String
// 	totalMusicTracks?: String
// 	storageUsed?: {
// 		googleDrive?: String
// 		dropbox?: String
// 		ipfs?: String
// 	}
// 	actions?: string[]
// 	projectList?: {
// 		name: String
// 		music: String
// 		minted_music: String
// 		collaborations: String
// 		createdAt: Date
// 		updatedAt: Date
// 	}

// }

// const UserSchema = new Schema<UserSchemaDoc>(
// 	{
// 		name: { type: String, unique: true, sparse: true },
// 		fullName: { type: String },
// 		wallet: String,
// 		wallets: [{
// 			addr: { type: String, required: true },
// 			provider: { type: String, required: true }
// 		}],
// 		email: { type: String, unique: true, sparse: true },
// 		emailVerifiedAt: Date,
// 		isEmailVerified: { type: Boolean, default: false },
// 		countryCode: { type: String },
// 		mobile: { type: String, unique: true, sparse: true },
// 		mobileVerifiedAt: Date,
// 		password: { type: String, select: false },
// 		passwordChangedAt: { type: Date },
// 		permissions: [Number],
// 		totalCollections: { type: Number, default: 0 },
// 		roleId: { type: ObjectId, ref: 'Role' },
// 		totalVolume: { type: Number, default: 0 },
// 		floorPrice: { type: Number, default: 0 },
// 		verification: {
// 			type: [
// 				{
// 					codeType: {
// 						type: String,
// 						enum: ['forgotPassword', 'resetPassword', 'twoFA', null],
// 					},
// 					referenceCode: String,
// 					code: String,
// 				},
// 			],
// 			_id: false,
// 			select: false,
// 		},
// 		FCMToken: [String],
// 		accountTypeCode: {
// 			type: String,
// 			default: Role.USER,
// 			enum: [Role.USER, Role.SUPER_ADMIN, Role.ADMIN],
// 		},
// 		profilePic: { type: String },
// 		coverPic: { type: String },
// 		profile_img: { type: String },
// 		description: { type: String },
// 		socialLinks: {
// 			type: {
// 				facebook: String,
// 				twitter: String,
// 				instagram: String,
// 				blog: String,
// 				website: String,
// 				discord: String,
// 			},
// 			default: {
// 				facebook: '',
// 				twitter: '',
// 				instagram: '',
// 				blog: '',
// 				website: '',
// 			},
// 			_id: false,
// 		},
// 		notificationSetting: {
// 			itemSold: {
// 				type: Boolean,
// 				default: true,
// 			},
// 			bidActivity: {
// 				type: Boolean,
// 				default: true,
// 			},
// 			priceChange: {
// 				type: Boolean,
// 				default: true,
// 			},
// 			outbid: {
// 				type: Boolean,
// 				default: true,
// 			},
// 			itemBought: {
// 				type: Boolean,
// 				default: true,
// 			},
// 			newsletter: {
// 				type: Boolean,
// 				default: true,
// 			},
// 		},
// 		roles: {
// 			type: String,
// 			default: Role.USER,
// 			enum: [Role.USER, Role.SUPER_ADMIN, Role.ADMIN],
// 		},
// 		isPublic: { type: String, default: 'public', enum: ['public', 'private'] },
// 		tags: [String],
// 		signature: { type: String },
// 		data: { type: String },
// 		reason: { type: String },
// 		isFirstLogin: { type: Boolean, default: true },
// 		isProfileDetailsUpdated: { type: Boolean, default: false },
// 		isQrGenerated: { type: Boolean, default: false },
// 		followingCount: { type: Number, default: 0 },
// 		followerCount: { type: Number, default: 0 },
// 		isVerified: { type: Boolean, default: false },
// 		isVerifiedFromBlockchain: { type: Boolean, default: false },
// 		isBlocked: { type: Boolean, default: false },
// 		isBanned: { type: Boolean, default: false },
// 		isDeleted: { type: Boolean, default: false },
// 		isActive: { type: Boolean, default: true },
// 		createdById: { type: ObjectId, ref: 'User', select: false },
// 		updatedById: { type: ObjectId, ref: 'User', select: false },
// 		isCollectionAccess: { type: Boolean, default: false },
// 		collectionAccessStatus: { type: String, default: "pending" },
// 		rejectReason: { type: String },
// 		address: { type: String },
// 		isRequestedCollectionAccess: { type: Boolean, default: false },
// 		isWhitelisted: { type: Boolean, default: false },
// 		isRequestForwhitelist: { type: Boolean, default: false }
// 	},
// 	{
// 		autoIndex: true,
// 		versionKey: false,
// 		timestamps: true,
// 	}

// )

// // Before Save Hook
// UserSchema.pre('save', async function (done) {
// 	if (this.isModified('password')) {
// 		const hashed = await Password.toHash(this.get('password'))
// 		this.set('password', hashed)
// 		this.set('passwordChangedAt', new Date())
// 	}
// 	done()
// })

// // Static Methods
// //  Create Validation Codes
// UserSchema.methods.createVerificationCode = async function (codeType: string): Promise<void> {
// 	await this.verification.push({
// 		codeType: codeType,
// 		code: GenerateRandomNumberOfLength(4),
// 		referenceCode: GenerateRandomStringOfLength(10),
// 	})
// }
// UserSchema.methods.createVerificationCodeSuperAdmin = async function (
// 	codeType: string
// ): Promise<void> {
// 	await this.verification.push({
// 		codeType: codeType,
// 		//For QA testing it's static for present
// 		code: '123456',
// 		// code: GenerateRandomNumberOfLength(6),
// 		referenceCode: GenerateRandomStringOfLength(10),
// 	})
// }
// // Nullify verification
// UserSchema.methods.deleteVerificationCode = async function (codeType: string): Promise<void> {
// 	await this.verification.pull({ 'verification.codeType': codeType })
// 	await this.save()
// }

// // Create 2FA code
// UserSchema.methods.create2FACode = async function (): Promise<UserDoc> {
// 	await this.delete2FACode()
// 	await this.createVerificationCode('twoFA')
// 	return this
// }

// // Create 2FA code
// UserSchema.methods.create2FACodeSuperAdmin = async function (): Promise<UserDoc> {
// 	await this.delete2FACode()
// 	await this.createVerificationCodeSuperAdmin('twoFA')
// 	return this
// }
// // Nullify 2FA code
// UserSchema.methods.delete2FACode = async function (): Promise<void> {
// 	await this.deleteVerificationCode('twoFA')
// }

// // Function to create a new User
// UserSchema.statics.build = async (attrs: UserAttrs | AdminAttrs) => {
// 	const user = new User(attrs)
// 	await user.save()
// 	return user
// }

// // Function to get document by id
// UserSchema.statics.getById = async (value: string, projection = {}) => {
// 	return App.Models.User.findOne({ _id: value }, projection)
// }

// // Function to get document by email
// UserSchema.statics.getByEmail = async (email: string) => {
// 	return App.Models.User.findOne({ email })
// }

// // Create Reset Password code
// UserSchema.methods.createResetPasswordCode = async function (): Promise<void> {
// 	await this.deleteResetPasswordCode()
// 	await this.createVerificationCode('resetPassword')
// }

// // Nullify Reset Password code
// UserSchema.methods.deleteResetPasswordCode = async function (): Promise<void> {
// 	await this.deleteVerificationCode('resetPassword')
// }

// // Create Forgot Password code
// UserSchema.methods.createForgotPasswordCode = async function (): Promise<void> {
// 	await this.deleteResetPasswordCode()
// 	await this.createVerificationCode('forgotPassword')
// }

// // Nullify Forgot Password code
// UserSchema.methods.deleteForgotPasswordCode = async function (): Promise<void> {
// 	await this.deleteVerificationCode('forgotPassword')
// }

// export const User = model<UserSchemaDoc, UserModel>('User', UserSchema)
