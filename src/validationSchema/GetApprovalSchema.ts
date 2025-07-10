import {
	INVALID_APPLE_MUSIC_URL,
	INVALID_INSTAGRAM_URL,
	INVALID_SPOTIFY_URL,
	INVALID_TIKTOK_URL,
	INVALID_X_URL,
	INVALID_YOUTUBE_URL
} from "@/constant/errorMessage"
import { z } from "zod"

function isValidUrl(val: string, domain: string) {
	try {
		const url = new URL(val)
		return url.hostname.includes(domain)
	} catch {
		return false
	}
}

const getApprovalSchema = z.object({
	username: z.string().min(1, { message: "Username is required" }),
	spotifyUrl: z
		.string()
		.min(1, { message: "Spotify URL is required" })
		.refine((val) => isValidUrl(val, "spotify.com"), INVALID_SPOTIFY_URL),
	appleUrl: z
		.string()
		.min(1, { message: "Apple Music URL is required" })
		.refine(
			(val) => isValidUrl(val, "music.apple.com"),
			INVALID_APPLE_MUSIC_URL
		),
	youtubeUrl: z
		.string()
		.min(1, { message: "Youtube URL is required" })
		.refine((val) => isValidUrl(val, "youtube.com"), INVALID_YOUTUBE_URL),
	instagramUrl: z
		.string()
		.min(1, { message: "Instagram URL is required" })
		.refine((val) => isValidUrl(val, "instagram.com"), INVALID_INSTAGRAM_URL),
	tiktokUrl: z
		.string()
		.min(1, { message: "Tiktok URL is required" })
		.refine((val) => isValidUrl(val, "tiktok.com"), INVALID_TIKTOK_URL),
	xUrl: z
		.string()
		.min(1, { message: "X URL is required" })
		.refine((val) => isValidUrl(val, "x.com"), INVALID_X_URL),
	message: z.string().min(1, { message: "Message is required" })
})

export type GetApprovalFormData = z.infer<typeof getApprovalSchema>
export default getApprovalSchema
