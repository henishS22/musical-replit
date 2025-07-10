import {
	BRIEF_REQUIRED,
	END_DATE_GREATER_THAN_START_DATE,
	LANGUAGES_REQUIRED,
	PROJECT_REQUIRED,
	TRACK_REQUIRED
} from "@/constant/errorMessage"
import { ProjectDataType } from "@/types/dashboarApiTypes"
import * as z from "zod"

const LanguageSchema = z.object({
	_id: z.string(),
	title: z.string()
})

export const createOpportunitySchema = z.object({
	selectedProject: z
		.custom<ProjectDataType>()
		.nullable()
		.refine((val) => val !== null, {
			message: PROJECT_REQUIRED
		}),

	title: z.string().min(1, "Title is required"),
	languages: z.array(LanguageSchema).refine((val) => val.length > 0, {
		message: LANGUAGES_REQUIRED
	}),
	skills: z.array(z.string()).optional(),
	styles: z.array(z.string()).optional(),
	designs: z.array(z.string()).optional(),
	duration: z
		.object({
			startDate: z.date(), // Optional to avoid early validation errors
			endDate: z.date()
		})
		.refine(
			(data) => {
				if (data.startDate && data.endDate) {
					return data.startDate < data.endDate
				}
				return true
			},
			{
				message: END_DATE_GREATER_THAN_START_DATE
			}
		),
	brief: z.string().min(10, BRIEF_REQUIRED),
	track: z.array(z.string()).nonempty(TRACK_REQUIRED)
})

export type CreateOpportunityFormData = z.infer<typeof createOpportunitySchema>
