// Types
export type LoginForm = {
	email: string
	password: string
	remember: string
}

export type SignupFormValues = {
	email: string
	username: string
	password: string
	confirmPassword: string
	name: string
}

export type WalletAuthFormData = {
	email: string
	firstName: string
}

// Interface
export interface ConnectWalletAuthButtonProps {
	isSignup?: boolean
	isLoading?: boolean
}

export interface WalletAuthProps {
	isSignup?: boolean
}

export type loginUsingCreds = {
	email: string
	pass: string
	withJwt: boolean
}
