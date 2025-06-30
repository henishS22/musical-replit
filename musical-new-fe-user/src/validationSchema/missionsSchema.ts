import { z } from "zod"

export const missionValidationSchemas = {
	connect_x: z.object({
		value: z.string().url("Please enter a valid URL")
	}),
	connect_tiktok: z.object({
		value: z.string().url("Please enter a valid URL")
	}),
	connect_instagram: z.object({
		value: z.string().url("Please enter a valid URL")
	}),
	connect_facebook: z.object({
		value: z.string().url("Please enter a valid URL")
	}),
	sign_up_for_email: z.object({
		value: z.string().email("Please enter a valid email address")
	}),
	sign_up_for_text: z.object({
		value: z.string().regex(/^\d{7,15}$/, "Please enter a valid mobile number")
	}),
	post_url: z.object({
		url: z
			.string()
			.url("Must be a valid URL")
			.min(1, "Profile URL is required"),
		post: z.string().url("Must be a valid URL").min(1, "Post URL is required")
	})
}

export const CreatorQuestSchema = z.object({
	instruction: z
		.string()
		.min(10, "Instruction must be at least 10 characters")
		.max(500, "Instruction must not exceed 500 characters"),
	caption: z
		.string()
		.min(5, "Caption must be at least 5 characters")
		.max(280, "Caption must not exceed 280 characters"),
	hashtags: z
		.array(z.string())
		.min(1, "At least one hashtag is required")
		.max(10, "Maximum 10 hashtags allowed"),
	mentions: z
		.array(z.string())
		.min(1, "At least one mention is required")
		.max(10, "Maximum 10 mentions allowed")
})
