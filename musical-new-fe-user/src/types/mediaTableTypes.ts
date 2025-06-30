import { StaticImageData } from "next/image"

import { MediaGenre } from "./libraryTypes"

export interface Paginations {
	pages: number
	total: number
	limit: number
	page: number
}
export interface Instrument {
	_id: string
	type: string
	title: {
		en: string
		pt: string
	}
	instrument: {
		en: string
		pt: string
	}
}

export interface Tags {
	_id: string
	definition: string
	title: {
		en: string
	}
}
export interface Track {
	// Define the properties of a track here
	artwork?: StaticImageData | string
	_id: string
	name: string
	extension: string
	thumbnail?: StaticImageData
	genre: MediaGenre[]
	instrument: Instrument[]
	tags: Tags[]
	size: number
	createdAt: string
	updatedAt: string
	user: {
		_id: string
		name: string
		profile_img: string | null
	}
	lyrics: string[]
	imageWaveBig?: StaticImageData
	imageWaveSmall?: StaticImageData
	action?: string
	url?: string
	duration?: number
	mediaType?: string
	isAIGenerated?: boolean
}

export interface MediaItem {
	tracks: Track[]
	pagination: Paginations
	// Add other properties of MediaItem if needed
}

export interface MediaListProps {
	mediaItems: MediaItem
	onAction?: (action: string, item: Track) => void
	isLoading: boolean
	className?: string
	folderId?: string
}
