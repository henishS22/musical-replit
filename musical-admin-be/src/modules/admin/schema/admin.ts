import { gql } from 'apollo-server-express'

const adminTypes = gql`
	type Query {
		"A list of admins"
		admins(
			after: String
			before: String
			first: Int
			last: Int
			orderBy: AdminOrderByInput!
			filters: AdminsWhereInput
		): AdminConnection!
		"Get admin details"
		admin(id: String!): Admin!
		"Own Admin profile"
		me: Admin!
		"Retrieve a list of requests"
		getRequests(
			after: String
			before: String
			first: Int
			last: Int
			orderBy: RequestOrderByInput!
		): RequestConnection!
	}

	type Mutation {
		"Create Admin with Permissions of Superuser"
		createAdmin(input: CreateAdminInput!): messageResponse!
		"Update Admin with Permissions of Superuser"
		updateAdmin(where: AdminWhereUpdateInput!, input: UpdateAdminInput!): messageResponse!
		"Delete Admin with Permissions of Superuser"
		deleteAdmin(where: AdminWhereUpdateInput!): messageResponse!
		"Disable the admin"
		disableAdmin(input: disableAdminInput!): messageResponse!
		"Enable the admin"
		enableAdmin(input: disableAdminInput!): messageResponse!
	}

	type UserEdge {
		"A cursor for use in pagination."
		cursor: ID!
		"A post at the end of an edge."
		node: User
	}

	type AdminEdge {
		"A cursor for use in pagination."
		cursor: ID!
		"A post at the end of an edge."
		node: Admin
	}

	type Admin {
		"Admin user id"
		id: ID!
		"Full name of the admin"
		fullName: String
		"Email address of the admin"
		email: String!
		"Permissions of the admin in format of booleans"
		permissions: Permissions!
		"Mobile number of the admin"
		mobile: String!
		"Country code of the admin's mobile"
		countryCode: String!
		"Profile picture of the admin"
		profilePic: String
		"Role details of the admin"
		role: Role!
		"Creator of the admin"
		createdBy: Admin
		"Last updater of the admin"
		updatedBy: Admin
		"Date of the creation of the admin"
		createdAt: Date
		"Status of Admin"
		isActive: Boolean!
		"verified blue tick boolean"
		isVerified: Boolean
		"Whether the user is blocked"
		isBlocked: Boolean
		"Whether the user is banned"
		isBanned: Boolean	
	}

	

	type UserConnection {
		"A list of post edges."
		edges: [UserEdge]
		"Information to assist with pagination."
		pageInfo: PageInfo!
	}

	type AdminConnection {
		"A list of post edges."
		edges: [AdminEdge]
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

	type messageResponse {
		"Response Message in string for success or failure."
		message: String!
		"Status of the response in boolean for success or failure."
		status: String!
	}

	type GetAdminResponse {
		"Response Message in string for success or failure."
		message: String!
		"Admin details for the admin"
		user: Admin!
	}

	type Verification {
		"The verification code type like Forgot Password/Reset Password"
		codeType: String!
		"Reference code for the sent verification code"
		referenceCode: String!
		"Verification code"
		code: String!
	}

	type GetAllAdminsResponse {
		message: String!
		users: [Admin!]
	}

	type Request {
		id: ID!
		isCollectionAccess: Boolean!
		reason: String!
		fullName: String!
		email: String!
		walletAddress: String!
		createdAt: Date!
		updatedAt: Date!
	}

	type RequestEdge {
		cursor: ID!
		node: Request
	}

	type RequestConnection {
		edges: [RequestEdge]
		pageInfo: PageInfo!
	}

	enum AdminOrderByInput {
		"Order admins ascending by creation time."
		createdAt_ASC
		"Order admins descending by creation time."
		createdAt_DESC
		"Order admins ascending by email."
		email_ASC
		"Order admins decending by email."
		email_DESC
		"Order admins ascending by last login."
		mobileVerifiedAt_ASC
		"Order admins descending by last login."
		mobileVerifiedAt_DESC
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

	input UsersWhereInput {
		"A date in proper format"
		createdAtFrom: String
		"A date in proper format"
		createdAtTo: String
		"Any specifie id for Roles"
		roleId: ID
		"User name of the user (match purpose)"
		usernameMatch: String
		"Boolean for whether user is verified or not"
		isVerifiedBool: String
		"User name of the user (search purpose)"
		username: String
		"Filter by collection access"
		isCollectionAccess: Boolean
		"Filter by reason"
		reason: String
	}

	input AdminsWhereInput {
		"A date in proper format for createdAt from"
		createdAtFrom: String
		"A date in proper format for createdAt to"
		createdAtTo: String
		"Any specifie id for Roles"
		roleId: ID
		"Filter Based On Created By, Pass Object ID"
		createdById: ID
		"A date in proper format for last login from"
		mobileVerifiedAtFrom: String
		"A date in proper format for last login to"
		mobileVerifiedAtTo: String
		"Search for admins matching name"
		fullName: String
		"Search for admins matching email"
		email: String
		"Search for admins matching mobile number"
		mobile: String
		"Boolean for whether user is verified or not"
		isVerifiedBool: String
		"Boolean for whether user is active or not"
		isActiveBool: String
	}

	input CreateAdminInput {
		"Email address of the admin"
		email: String! @constraint(format: "email", maxLength: 255)
		"Mobile number of the admin without countryCode"
		mobile: String! @constraint(pattern: "^[0-9]*$", maxLength: 15)
		"Country code of the admin"
		countryCode: String! @constraint(maxLength: 5)
		"Full name of the admin"
		fullName: String! @constraint(maxLength: 100)
		"Role Id for the admin"
		roleId: ID!
	}

	input UpdateAdminInput {
		"Email address of the admin"
		email: String
		"Mobile number of the admin without countryCode"
		mobile: String
		"Country code of the admin"
		countryCode: String
		"Full name of the admin"
		fullName: String
		"Role Id for the admin"
		roleId: ID
		"Permissions for the admin"
		permissions: PermissionsInput
	}

	enum RequestOrderByInput {
		"Order requests ascending by creation time."
		createdAt_ASC
		"Order requests descending by creation time."
		createdAt_DESC
	}

	input AdminWhereUpdateInput {
		"User id of the admin"
		id: ID!
	}

	input disableAdminInput {
		id: String!
	}

	enum CollectionAccessAction {
		approved
		rejected
	}

	input UpdateCollectionAccessRequestInput {
		"Admin user id"
		userId: ID!
		"Action to perform on the request: approved or rejected"
		action: CollectionAccessAction!
		"Username of the user for whom the collection access request is being updated"
		username: String!
	}
`

export default adminTypes
