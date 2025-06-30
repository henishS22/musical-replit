export interface YouTubeOptions {
	title: string
	visibility: "public" | "private" | "unlisted"
	tags: string[]
}

export interface SocialMediaPostPayload {
	post: string
	platforms: string[]
	mediaUrls: string[]
	scheduleDate?: string
	youTubeOptions?: YouTubeOptions
	isVideo?: boolean
}

export interface AyrshareJwtResponse {
	emailSent: boolean
	expiresIn: string
	status: string
	title: string
	token: string
	url: string
}

export type AyrshareProfile = {
	activeSocialAccounts: string[] // List of social accounts
	created: {
		_seconds: number
		_nanoseconds: number
	}
	createdUTC: string // ISO date string
	refId: string // Unique reference ID
	tags: string[] // List of tags
	title: string // Profile title
}

export type AyrshareProfilesResponse = {
	profiles: AyrshareProfile[]
	count: number
}
