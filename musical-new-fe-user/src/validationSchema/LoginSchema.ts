import {
	EMAIL_REQUIRED,
	INVALID_EMAIL,
	PASSSWORD_REQUIRED
} from "@/constant/errorMessage"
import { z } from "zod"

// Schema for login
const loginSchema = z.object({
	email: z.string().nonempty(EMAIL_REQUIRED).email(INVALID_EMAIL),
	password: z.string().nonempty(PASSSWORD_REQUIRED)
	// remember: z.boolean()
})

export default loginSchema
