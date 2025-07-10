import {
	EMAIL_REQUIRED,
	INVALID_EMAIL,
	INVALID_MOBILE,
	MOBILE_REQUIRED
} from "@/constant/errorMessage"
import { z } from "zod"

const InviteSchema = (type: "email" | "sms") =>
	z.object({
		[type]:
			type === "email"
				? z.string().nonempty(EMAIL_REQUIRED).email(INVALID_EMAIL)
				: z
						.string()
						.nonempty(MOBILE_REQUIRED)
						.regex(/^\d{7,15}$/, INVALID_MOBILE)
	})

export default InviteSchema
