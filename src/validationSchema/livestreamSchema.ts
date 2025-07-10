import {
	ARTWORK_REQUIRED,
	LIVESTREAM_TYPE_REQUIRED,
	TITLE_INVALID_CHARACTERS,
	TITLE_REQUIRED,
	TITLE_TOO_LONG,
	TOKEN_REQUIRED
} from "@/constant/errorMessage"
import { z } from "zod"

export const livestreamSchema = z
	.object({
		title: z
			.string()
			.min(1, TITLE_REQUIRED)
			.max(100, TITLE_TOO_LONG)
			.regex(/^[a-zA-Z0-9\s]+$/, { message: TITLE_INVALID_CHARACTERS }),
		description: z.string(),
		artwork: z.custom<File>(
			(val) => typeof File !== "undefined" && val instanceof File,
			{ message: ARTWORK_REQUIRED }
		),
		livestreamType: z.string().min(1, LIVESTREAM_TYPE_REQUIRED),
		accessType: z.enum(["public", "private"]).default("public"),
		nftId: z.array(z.string())
	})
	.refine(
		(data) => {
			if (data.accessType === "private") {
				return data.nftId && data.nftId.length > 0
			}
			return true
		},
		{
			message: TOKEN_REQUIRED,
			path: ["nftId"]
		}
	)
