import {
	INVALID_APPLE_MUSIC_URL,
	INVALID_INSTAGRAM_URL,
	INVALID_SPOTIFY_URL,
	INVALID_TIKTOK_URL,
	INVALID_X_URL,
	INVALID_YOUTUBE_URL
} from "@/constant/errorMessage"
import { z } from "zod"

export const profileSchema = z.object({
	name: z.string().optional(),
	username: z.string().optional(),
	descr: z.string().optional(),
	country: z.string().optional(),
	state: z.string().optional(),
	city: z.string().optional(),
	clb_interest: z.array(z.string()).optional(),
	clb_setup: z.array(z.string()).optional(),
	clb_availability: z.string().optional(),
	spotify: z
		.string()
		.refine(
			(val) => !val || isValidUrl(val, "spotify.com"),
			INVALID_SPOTIFY_URL
		)
		.optional(),
	apple_music: z
		.string()
		.refine(
			(val) => !val || isValidUrl(val, "music.apple.com"),
			INVALID_APPLE_MUSIC_URL
		)
		.optional(),
	youtube: z
		.string()
		.refine(
			(val) => !val || isValidUrl(val, "youtube.com"),
			INVALID_YOUTUBE_URL
		)
		.optional(),
	instagram: z
		.string()
		.refine(
			(val) => !val || isValidUrl(val, "instagram.com"),
			INVALID_INSTAGRAM_URL
		)
		.optional(),
	tiktok: z
		.string()
		.refine((val) => !val || isValidUrl(val, "tiktok.com"), INVALID_TIKTOK_URL)
		.optional(),
	twitter: z
		.string()
		.refine((val) => !val || isValidUrl(val, "x.com"), INVALID_X_URL)
		.optional()
})

function isValidUrl(val: string, domain: string) {
	try {
		const url = new URL(val)
		return url.hostname.includes(domain)
	} catch {
		return false
	}
}
