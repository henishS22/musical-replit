export interface MediaItem {
	id: string
	title: string
	artist: string
	audioUrl: string
	videoUrl?: string
	coverUrl: string
	duration: number
}

export type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2
