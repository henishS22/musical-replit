import { gql } from 'apollo-server-express'

const meTypes = gql`
	type Query {
		"Get profile information"
		profile(id: String!): UserProfilePayload!
	}

	type Mutation {
		"Check the username is exist for updating the current user name"
		checkUserNameExist(input: CheckUserNameExistInput!): CheckUserNameExistPayload!
		"check the email is exist for updating the current user email"
		checkUserEmailExist(input: CheckUserEmailExistInput!): CheckUserEmailExistPayload!
		"Update user profile for the current user."
		updateProfile(input: UpdateUserProfileInput!): messageResponse!
	}

	input CheckUserNameExistInput {
		"username provided by user"
		username: String!
	}
	input CheckUserEmailExistInput {
		"Email provided by user"
		email: String!
	}

	input UpdateUserProfileInput {
		"username provided by user"
		email: String
		"username provided by user"
		username: String
		"profile picture provided by the user"
		profilePic: String
		"Cover picture picture provided by the user"
		coverPic: String
		"biography provided by the user"
		description: String
		"Socials Cred links provided by the user"
		socialLinks: SocialMediaLinksInput
		"Tags for the user"
		tags: [String]
		"notification Setting of user"
		notificationSetting: NotificationSettingInput
		isPublic: String
	}
	input NotificationSettingInput {
		itemSold: Boolean
		bidActivity: Boolean
		priceChange: Boolean
		outbid: Boolean
		itemBought: Boolean
		newsletter: Boolean
	}

	type NotificationSetting {
		itemSold: Boolean
		bidActivity: Boolean
		priceChange: Boolean
		outbid: Boolean
		itemBought: Boolean
		newsletter: Boolean
	}
	type CheckUserNameExistPayload {
		"Response message in string"
		message: String!
		"Status of the response in boolean for success or failure"
		status: String!
	}

	type UserProfilePayload {
		"user id"
		id: ID!
		"Full name of the user"
		fullName: String
		"Username of the user"
		username: String
		"Email address of the user"
		email: String
		"User Profile Bio"
		description: String
		"Mobile number of the user"
		mobile: String
		"Country code of the user's mobile"
		countryCode: String
		"Profile picture of the user"
		profilePic: String
		"Cover picture picture provided by the user"
		coverPic: String
		"walletAddress of the user"
		walletAddress: String
		"Date of the creation of the user"
		createdAt: Date!
		"Social media links of the user"
		socialLinks: SocialMediaLinks
		"verified blue tick boolean"
		isVerified: Boolean
		"Whether the user is blocked"
		isBlocked: Boolean
		"tags for the user"
		tags: [String]
		"Total traded Volume of user"
		totalVolume: Float
		"Total collection created by the user"
		totalCollections: String
		"Total NFT's owned by the user"
		totalNfts: String
		"notification Setting of user"
		notificationSetting: NotificationSetting
		"flag for public profile"
		isPublic: String
	}

	type CheckUserEmailExistPayload {
		"Response message in string"
		message: String!
		"Status of the response in boolean for success or failure"
		status: String!
	}

	input Links {
		"URl for facebook provided by the user"
		facebook: String
		"URl for twitter provided by the user"
		twitter: String
		"URl for instagram provided by the user"
		instagram: String
		"URl for instagram provided by the user"
		website: String
		"URl for instagram provided by the user"
		discord: String
	}

`

export default meTypes
