import { gql } from 'apollo-server-express'

const userTypes = gql`
	type Query {
		"A list of users"
		users(
			after: String
			before: String
			first: Int
			last: Int
			orderBy: UserOrderByInput!
			filters: UsersWhereInput
		): UserConnection!
		"A list of  accounts"
		account(
			after: String
			before: String
			first: Int
			last: Int
			orderBy: UserOrderByInput!
			filters: UsersWhereInput
		): AccountConnection!
		"A list of users"
		usersRequests(
			after: String
			before: String
			first: Int
			last: Int
			orderBy: UserOrderByInput!
			filters: UsersWhereInput
		): UserConnection!
		"Get User details"
		user(id: String!): getUserdata!
		"Search acrross user and categories"
		search(input: SearchInput!): SearchResponsePayload!
		"get thefollowers for the user"
		followers(userId: String): FollowerDoc!
		"upload image to S3 bucket"
		uploadImage(input: UploadImageInput!): UploadImageResponsePayload!
	}

	type getUserdata {
		user: User
		totalProject: String
		totalMusicTracks: String
		projectList: [ProjectList]
	}
	type Mutation {
		verifyUser(input: Input!): ResponsePayload!
		blockUser(input: Input!): ResponsePayload!
		banUser(input: BanUserInput!): ResponsePayload!
		followUser(input: Input): ResponsePayload!
		unfollowUser(input: Input): ResponsePayload!
		updateSocialLink(input: SocialMediaLinksInput!): User!
		askQuestion(input: askQuestionInput): ResponsePayload!
		updateUserDetails(input: updateUserDetailsInput): updateUserDetailsResponsePayload!
	}

	input askQuestionInput {
		subject: String!
		description: String!
		email: String!
	}

	type FollowerDoc {
		id: ID
		followingIds(
			after: String
			before: String
			first: Int
			last: Int
			orderBy: UserOrderByInput
			filters: UsersWhereInput
		): UserConnection!
		followerIds(
			after: String
			before: String
			first: Int
			last: Int
			orderBy: UserOrderByInput
			filters: UsersWhereInput
		): UserConnection!
		userId: ID
		totalFollower: Int
		totalFollowing: Int
	}

	type Wallet {
		addr: String
		provider: String
    }

	type User {
		"user id"
		id: ID!
		"Full name of the user"
		fullName: String
		username: String
		"Username of the user"
		name: String
		"Email address of the user"
		email: String
		"User Profile Bio"
		description: String
		"Mobile number of the user"
		mobile: String
		"address of the user"
		address: String
		"Country code of the user's mobile"
		countryCode: String
		"Profile picture of the user"
		profilePic: String
		"Cover picture picture provided by the user"
		coverPic: String
		"walletAddress of the user"
		wallet: String
        profile_img:String
		"Date of the creation of the user"
		createdAt: Date!
		"Social media links of the user"
		socialLinks: SocialMediaLinks
		"verified blue tick boolean"
		isVerified: Boolean
		"Whether the user is blocked"
		isBlocked: Boolean
		"Whether the user is banned"
		isBanned: Boolean
		"Whether the User Profile Details Updated is banned"
		isProfileDetailsUpdated: Boolean
		"Whether the user is has isCollectionAccess"
		isWhitelisted: Boolean
		isRequestForwhitelist: Boolean
		isCollectionAccess: Boolean
		"Collection access status of the user"
		collectionAccessStatus: String
		"Reason for rejection if any"
		rejectReason: String
		"Whether collection access was requested"
		isRequestedCollectionAccess: Boolean
		"Collection for the user"
		tags: [String]
		"total traded volume by user"
		totalVolume: Float
		totalCollections: String
		"Total NFT's owned by the user"
		totalNfts: String
		"floor price of user"
		floorPrice: Float
		"flag for public profile"
		isPublic: String
		wallets:[Wallet]
		isDistroApproved:Boolean
	}

	type StorageData {
		"Google drive data"
		googleDrive: String
		"Dropbox data"
		dropbox: String
		"Ipfs data"
		ipfs: String
	}

	type UserCollectionStatusPayload {
		"user data"
		data: User
		"Response message in string"
		message: String!
		"Status of the response in boolean for success or failure"
		status: String!
		"isCollectionAccess"
		isCollectionAccess: Boolean
	}

	type Account {
		"Account ID"
		_id: ID!
		"Wallet address of the account"
		walletAddress: String
		"KYC information"
		kyc: KYCInfo
		"Stripe customer information"
		stripe: StripeInfo
		"Date when the account was created"
		createdAt: Date
		"Date when the account was last updated"
		updatedAt: Date
	}
	type KYCInfo {
		"KYC status"
		status: String
		"KYC reference ID"
		reference: String
		"KYC verification URL"
		verification_url: String
	}

	type StripeInfo {
		"Stripe customer ID"
		customer: StripeCustomer
	}

	type StripeCustomer {
		"Customer ID"
		_id: String
	}
	type UserEdge {
		"A cursor for use in pagination."
		cursor: ID!
		"A post at the end of an edge."
		node: User
	}
	type AccountEdge {
		"A cursor for use in pagination."
		cursor: ID!
		"A post at the end of an edge."
		node: Account
	}

	type UserConnection {
		"A list of post edges."
		edges: [UserEdge]
		"Information to assist with pagination."
		pageInfo: PageInfo!
	}
	type AccountConnection {
		"A list of post edges."
		edges: [AccountEdge]
		"Information to assist with pagination."
		pageInfo: PageInfo!
	}

	type PageInfo {
		"The cursor to continue from when paginating forward."
		endCursor: ID
		"Whether there are more items when paginating forward."
		hasNextPage: Boolean!
		"Whether there are more items when paginating backward."
		hasPreviousPage: Boolean!
		"The cursor to continue from them paginating backward."
		startCursor: ID
	}

	type ResponsePayload {
		"Response message in string"
		message: String!
		"Status of the response in boolean for success or failure"
		status: String!
	}
	type SearchResult {
		"Id of the search result"
		id: ID!
		"Search result."
		result: String!
		"Search result from which model"
		model: String!
		"Image of search result"
		image: String
	}
	type SearchResponsePayload {
		"Response message in string"
		message: String!
		"Status of the response in boolean for success or failure"
		status: String!
		"Search result data for the keyword provided by the user"
		searchResult: [SearchResult]
	}

	type ImageUpload {
		preSignedUrl: String
		keyName: String
		s3Url: String
		keyPath: String
		fullPath: String
	}
	type UploadImageResponsePayload {
		"Response message in string"
		message: String!
		"Status of the response in boolean for success or failure"
		status: String!
		"Image URL for the uploaded image"
		imageUrl: ImageUpload
	}
	input Input {
		"User Id to of the user."
		id: String!
	}

	input updateUserDetailsInput {
		fullName: String!
		email: String!
		mobile: String!
		countryCode: String!
		address: String
	}

	type updateUserDetailsResponsePayload {
		status: String!
		message: String!
		user: User # Return the updated user
	}

	input BanUserInput {
		"User Id to of the user."
		id: String!
		"Banned status of the user"
		isBanned: Boolean
	}

	enum UserOrderByInput {
		"Order admins ascending by creation time."
		createdAt_ASC
		"Order admins descending by creation time."
		createdAt_DESC
		"Order admins ascending by email."
		email_ASC
		"Order admins ascending by email."
		email_DESC
		"Order admins ascending by name"
		name_ASC
	}
	input UploadImageInput {
		name: String
		extension: String
	}
	input UsersWhereInput {
		"A date in proper format"
		createdAtFrom: String
		"A date in proper format"
		createdAtTo: String
		"Any specifie id for Roles"
		roleId: ID
		"User name of the user (match purpose)"
		nameMatch: String
		"Boolean for whether user is verified or not"
		isVerifiedBool: String
		"User name of the user (search purpose)"
		name: String
		"email of the user (search purpose)"
		email: String
		"wallet of the user (search purpose)"
		wallet: String
		searchUser:String
	}
	scalar Date

	enum AccountType {
		ADMIN
		SUPER_ADMIN
		USER
	}

	type Verification {
		codeType: String!
		referenceCode: String!
		code: String!
	}

	type SocialMediaLinks {
		"URl for facebook provided by the user"
		facebook: String
		"URl for twitter provided by the user"
		twitter: String
		"URl for instagram provided by the user"
		instagram: String
		"URl for instagram provided by the user"
		blog: String
		"Custom URL of the user"
		website: String
		"URL of discord server"
		discord: String
	}

	type Collaborator {
		user: ID
		invitedForProject: Boolean
		roles: [ID]
		permission: String
		split: String
		accepted:Boolean
	}

	type ProjectList {
		name: String
		music: String
		minted_music: String
		collaborations: [Collaborator]
		createdAt: Date
		updatedAt: Date
	}

	input SocialMediaLinksInput {
		"URl for facebook provided by the user"
		facebook: String
		"URl for twitter provided by the user"
		twitter: String
		"URl for instagram provided by the user"
		instagram: String
		"URl for blog provided by the user"
		blog: String
		"Custom URL of the user"
		website: String
		"URL for discord Server"
		discord: String
	}

	input SearchInput {
		"Keyword for search "
		keyword: String
	}
`

export default userTypes
