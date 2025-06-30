import { gql } from 'apollo-server-express'

const authTypes = gql`
	type Mutation {
		"Sign Up for users"
		signUp(input: SignUpInput!): SignUpPayload!
		"Sign In for users"
		signIn(input: SignInInput!): SignInPayload!
		"Reset Password for users"
		resetPassword(input: ResetPasswordInput!): ResetPasswordPayload!
		"Verify email for users"
		verifyEmail(input: VerifyEmailInput!): VerifyEmailPayload!
		"Update mobile phone number for users"
		updateMobile(input: UpdateMobileInput!): UpdateMobilePayload!
		"Update password for users"
		updatePassword(input: UpdatePasswordInput!): UpdatePasswordPayload!
	}

	input SignUpInput {
		"Wallet Address provided by user"
		walletAddress: String!
		"Signature provided by the user"
		signature: String
		"data provided by the user"
		data: String
	}

	type SignUpPayload {
		"Response message in string"
		message: String!
		"User provides all the information about the new user"
		user: User!
		"Status of the response in boolean for success or failure"
		status: String!
		"Jwt token for the user"
		token: String!
		"It is boolean for isProfileDetailsUpdated verification"
		isProfileDetailsUpdated: Boolean
	}

	input SignInInput {
		"Email field provided by user"
		email: String!
		# mobile: String
		"Password field provided by user"
		password: String!
		"Code will be sent to user mobile when grantType will be twoFA"
		code: String
		"It is enum for twoFA or PASSWORD"
		grantType: GrantType!
	}

	type SignInMutPayload {
		"Response message in string"
		message: String!
		"Reference code will be sent to user mobile when grantType will be twoFA"
		referenceCode: String
		"It is boolean for first time verification"
		isFirstLogin: Boolean
		"Bearer Token for next time Authentication"
		token: String
		"QR Code for Google Authenticator"
		qrCode: String
		"Status of the response in boolean for success or failure"
		status: String!
	}

	enum GrantType {
		"Type for Password"
		PASSWORD
		"Type for TwoFactorAuthentication"
		twoFA
	}

	input ResetPasswordInput {
		"Request type enum for REQUEST or twoFA"
		reqType: ResetPasswordReqType!
		"Email address of the user"
		email: String!
		"Verification code sent to user mobile"
		code: String
		"Password with minimum length of 8"
		newPassword: String
	}

	input VerifyEmailInput {
		"Email address provided by user"
		email: String!
		"Id of verification sent to user email"
		id: ID!
	}

	enum ResetPasswordReqType {
		"Type for Request"
		REQUEST
		"Type for TwoFactorAuthentication"
		twoFA
	}

	type SignInPayload {
		"Response message in string"
		message: String!
		"Reference code will be sent to user mobile when grantType will be twoFA"
		referenceCode: String
		"It is boolean for first time verification"
		isFirstLogin: Boolean
		"Bearer Token for next time Authentiaction"
		token: String
		"acoount type in enum ADMIN, SUPER_ADMIN"
		accountTypeCode: AccountType
		"Mobile nmuber of the user"
		mobile: String
		"Country code of the user"
		countryCode: String
		userId: String
	}

	type ResetPasswordPayload {
		"Response message in string"
		message: String!
		"Reference code for verification code sent to user mobile"
		referenceCode: String
	}

	type VerifyEmailPayload {
		"Response message in string"
		message: String!
	}

	type UpdateMobilePayload {
		"Response message in string"
		message: String!
		"Reference code will be sent to user mobile when grantType will be twoFA"
		referenceCode: String
		"Status of the response in boolean for success or failure"
		status: String
		"Mobile number of the user"
		mobile: String
		"Country code of the user"
		countryCode: String
	}

	enum updateMobileReqType {
		"Type for update"
		UPDATE
		"Type for TwoFactorAuthentication"
		twoFA
	}
	input UpdateMobileInput {
		"ID of the user"
		id: String!
		"Mobile nmuber provided by user"
		mobile: String!
		"Code will be sent to user mobile when grantType will be twoFA"
		code: String
		"It is enum for twoFA or UPDATE"
		grantType: updateMobileReqType!
		"Country code of the user"
		countryCode: String!
	}

	type UpdatePasswordPayload {
		"Response message in string"
		message: String!
		"Status of the response in boolean for success or failure"
		status: String
		"Reference code will be sent to user mobile"
		referenceCode: String
		"Mobile number of the user"
		mobile: String
		"Country code of the user"
		countryCode: String
	}

	enum updatePasswordReqType {
		"Type for update"
		UPDATE
		"Type for TwoFactorAuthentication"
		twoFA
	}

	input UpdatePasswordInput {
		"Email field provided by user"
		email: String!
		"Old password provided by user"
		password: String!
		"New password of the user"
		newPassword: String!
		"It is enum for twoFA or UPDATE"
		grantType: updatePasswordReqType!
		"Code will be sent to user mobile"
		code: String
	}
`

export default authTypes
