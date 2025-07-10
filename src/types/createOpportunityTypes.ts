// import { File } from "buffer"

import { Project } from "@/components/dashboard/existingProContent"

export interface Language {
	_id: string
	title: string
}

export interface Design {
	_id: string
	title: string
}

export interface CreateOpportunityPayload {
	projectId: string
	title: string
	brief: string
	seeking?: string[]
	styles?: string[]
	languages: string[]
	collaborationType?: string
	collaborateWith: string
	duration: {
		startFrom: Date
		endTo: Date
	}
	designs?: string[]
	tracks: string[]
}

export interface OpportunityInputData {
	brief: string
	currentStep: number
	currentTrackId: string
	collaborationType?: string
	designs?: string[]
	duration: { startDate: string; endDate: string }
	languages: Language[]
	languagesId: string[]
	selectedProject: Project
	selectedTracks: fetchTrack[]
	skills: string[]
	stepsCompleted: boolean[]
	styles: string[]
	title: string
	uploadedTrack: fetchTrack
}

export interface fetchTrack {
	// Define the properties of a track here
	artwork: string | File
	_id: string
	name: string
	extension: string
	genre: {
		_id: string
		title: string
	}[]
	instrument: {
		_id: string
		title: string
	}[]
	tags: {
		_id: string
		title: string
	}[]
	user: {
		_id: string
		name: string
		profile_img: string | null
	}
	imageWaveBig?: string
	imageWaveSmall?: string
	url?: string
	duration?: number
	mediaType?: string
	createdAt?: string
	lyrics?: Lyrics[]
	isAIGenerated?: boolean
}

export interface Lyrics {
	_id: string
	title: string
	lines: string[]
}

export interface SocialMediaPostHistory {
	history: {
		autoHashtag: {
			max: number
		}
		created: string
		id: string
		mediaUrls: string[]
		platforms: string[]
		post: string
		postIds: {
			status: string
			id: string | number
			postUrl: string
			platform: string
		}[]
		profileTitle: string
		refId: string
		scheduleDate: string
		shortenLinks: boolean
		status: string
		type: string
		youTubeOptions: {
			title: string
			visibility: "public" | "private" | "unlisted"
			tags: string[]
		}
	}[]
}
