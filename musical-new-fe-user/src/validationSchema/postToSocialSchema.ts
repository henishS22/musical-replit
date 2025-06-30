import {
	// ARTWORK_REQUIRED,
	POST_TEXT_MAX_LENGTH,
	POST_TEXT_REQUIRED,
	TRACK_FILE_REQUIRED,
	TRACK_NAME_REQUIRED
} from "@/constant/errorMessage"
import { z } from "zod"

export const postSchema = z.object({
	trackName: z.string().min(1, TRACK_NAME_REQUIRED),
	postText: z
		.string()
		.max(280, POST_TEXT_MAX_LENGTH)
		.transform((str) => str.trim())
		.refine((val) => val.length > 0, POST_TEXT_REQUIRED),
	trackfile: z.string().min(1, TRACK_FILE_REQUIRED),
	// artwork: z.string().refine((val) => val !== undefined, ARTWORK_REQUIRED),
	hashtags: z.array(z.string())
})
