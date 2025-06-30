import {
	ARTWORK_REQUIRED,
	AUDIO_FILE_REQUIRED,
	COLLABORATOR_REQUIRED,
	PRODUCT_TITLE_INVALID_CHARACTERS,
	PRODUCT_TITLE_REQUIRED,
	PRODUCT_TITLE_TOO_LONG,
	PROJECT_TYPE_REQUIRED,
	ROLE_REQUIRED,
	SPLIT_PERCENTAGE_REQUIRED,
	SPLIT_TOTAL_INVALID
} from "@/constant/errorMessage"
import { z } from "zod"

export const collaboratorSchema = z.object({
	name: z.string(),
	image: z.any(), // You might want to make this more specific based on your needs
	roles: z
		.array(z.string())
		.min(1, {
			message: ROLE_REQUIRED
		})
		.refine((roles) => roles.length > 0, {
			message: ROLE_REQUIRED
		})
		.default([]),
	permission: z.string(),
	split: z.number().min(1, { message: SPLIT_PERCENTAGE_REQUIRED }).max(100),
	userId: z.string().optional(),
	email: z.string().optional(),
	invitedForProject: z.boolean().optional()
})

export const projectSchema = z.object({
	productTitle: z
		.string()
		.min(1, PRODUCT_TITLE_REQUIRED)
		.max(100, PRODUCT_TITLE_TOO_LONG)
		.regex(/^[a-zA-Z0-9\s]+$/, { message: PRODUCT_TITLE_INVALID_CHARACTERS }),
	recordedFile: z
		.string({
			required_error: AUDIO_FILE_REQUIRED
		})
		.optional(),

	artwork: z.union([
		z.string(),
		z.custom<File>(
			(val) => typeof File !== "undefined" && val instanceof File,
			{ message: ARTWORK_REQUIRED }
		)
	]),

	projectType: z.enum(["single", "album"], {
		required_error: PROJECT_TYPE_REQUIRED
	}),

	collaborators: z
		.array(collaboratorSchema)
		.min(1, COLLABORATOR_REQUIRED)
		.refine(
			(collaborators) => {
				const totalSplit = collaborators.reduce(
					(sum, collab) => sum + collab.split,
					0
				)
				return totalSplit === 100
			},
			{
				message: SPLIT_TOTAL_INVALID
			}
		)
})

export type ProjectFormData = z.infer<typeof projectSchema>
