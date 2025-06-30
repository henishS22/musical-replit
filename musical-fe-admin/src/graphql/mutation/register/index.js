/* eslint-disable  */

import { gql } from '@apollo/client'

// Test mutation
export const PING = gql`
	mutation Mutation {
		ping
	}
`
// Sign in mutation
export const SIGNIN = gql`
	mutation Mutation($input: SignInInput!) {
		signIn(input: $input) {
			message
			referenceCode
			mobile
			countryCode
			accountTypeCode
		}
	}
`
// 2FA Otp verification mutation
export const OTP_VERIFY = gql`
	mutation Mutation($input: SignInInput!) {
		signIn(input: $input) {
		message
		referenceCode
		isFirstLogin
		token
		}
	}
`
// Reset Password mutation
export const RESET_PASSWORD = gql`
	mutation ResetPassword($input: ResetPasswordInput!) {
		resetPassword(input: $input) {
		message
		referenceCode
		}
	}
`
// Qr code verified
export const VERIFY_QR_CODE = gql`
	mutation SignIn($input: SignInInput!) {
		signIn(input: $input) {
		message
		referenceCode
		token
		}
	}
` 
// Verify security code
export const VERIFY_SECURITY_CODE = gql`
	mutation SignIn($input: SignInInput!) {
		signIn(input: $input) {
		message
		referenceCode
		token
		}
	}
`