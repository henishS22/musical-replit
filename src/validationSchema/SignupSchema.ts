/* eslint-disable no-useless-escape */
import {
	CONFIRM_PASSSWORD_MATCH,
	CONFIRM_PASSSWORD_REQUIRED,
	EMAIL_REQUIRED,
	INVALID_EMAIL,
	NAME_MIN_LENGTH,
	NAME_REQUIRED,
	PASSSWORD_INVALID,
	PASSSWORD_MIN_LENGTH,
	PASSSWORD_REQUIRED,
	USERNAME_MIN_LENGTH,
	USERNAME_REQUIRED
} from "@/constant/errorMessage"
import { z } from "zod"

// Schema for Signup form
export const signupSchema = z
	.object({
		name: z.string().nonempty(NAME_REQUIRED).min(2, NAME_MIN_LENGTH),
		username: z
			.string()
			.nonempty(USERNAME_REQUIRED)
			.min(2, USERNAME_MIN_LENGTH),
		email: z.string().nonempty(EMAIL_REQUIRED).email(INVALID_EMAIL),
		password: z
			.string()
			.nonempty(PASSSWORD_REQUIRED)
			.min(8, PASSSWORD_MIN_LENGTH)
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~`!@#$%^&*()_\-+={\[\]}|\\:;"'<,>.?/])[A-Za-z\d~`!@#$%^&*()_\-+={\[\]}|\\:;"'<,>.?/]{8,}$/,
				PASSSWORD_INVALID
			),
		confirmPassword: z.string().nonempty(CONFIRM_PASSSWORD_REQUIRED)
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: CONFIRM_PASSSWORD_MATCH,
		path: ["confirmPassword"]
	})

// Schema for wallet signup form
export const walletAuthSchema = (isSignup: boolean) =>
	z.object({
		email: isSignup
			? z.string().nonempty(EMAIL_REQUIRED).email(INVALID_EMAIL)
			: z.string().optional(),
		firstName: isSignup
			? z.string().nonempty(NAME_REQUIRED).min(2, NAME_MIN_LENGTH)
			: z.string().optional()
	})

export const resetPasswordSchema = z
	.object({
		password: z
			.string()
			.nonempty(PASSSWORD_REQUIRED)
			.min(8, PASSSWORD_MIN_LENGTH)
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~`!@#$%^&*()_\-+={\[\]}|\\:;"'<,>.?/])[A-Za-z\d~`!@#$%^&*()_\-+={\[\]}|\\:;"'<,>.?/]{8,}$/,
				PASSSWORD_INVALID
			),
		confirmPassword: z.string().nonempty(CONFIRM_PASSSWORD_REQUIRED)
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: CONFIRM_PASSSWORD_MATCH,
		path: ["confirmPassword"]
	})
