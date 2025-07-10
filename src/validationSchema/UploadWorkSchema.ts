import {
	ARTWORK_REQUIRED,
	AUDIO_FILE_REQUIRED,
	// GENERS_REQUIRED,
	// INSTRUMENT_REQUIRED,
	// MAX_TAG,
	// TAGS_REQUIRED,
	// TITLE_REQUIRED,
	TITLE_TOO_LONG
} from "@/constant/errorMessage"
import { z } from "zod"

export const uploadSchema = z.object({
	productTitle: z.string().max(100, TITLE_TOO_LONG).optional(),
	recordedFile: z.union([
		z.string(),
		z.custom<File>(
			(val) => typeof File !== "undefined" && val instanceof File,
			{ message: AUDIO_FILE_REQUIRED }
		)
	]),
	artwork: z
		.custom<File>((val) => typeof File !== "undefined" && val instanceof File, {
			message: ARTWORK_REQUIRED
		})
		.optional(),
	instruments: z.array(z.string()).optional(),

	geners: z.array(z.string()).optional(),

	tags: z.array(z.string()).optional()
})

export type UploadFormData = z.infer<typeof uploadSchema>
