import { PlaybackSpeed } from "@/types/media"
import { Track } from "@/types/mediaTableTypes"

export interface MediaControls {
	handleTimeUpdate: () => void
	handleLoadedMetadata: () => void
	handleError: () => void
	togglePlay: () => void
	seek: (time: number) => void
	updateVolume: (value: number) => void
	updateSpeed: (value: PlaybackSpeed) => void
	toggleVideoMode: () => void
	handleClose?: () => void
}

export interface MediaPlayerProps {
	audioUrl?: string
	videoUrl?: string
	title: string
	artist: string
	coverUrl: string
	duration: number
	extension: string
	startTime?: number
	item: Track
}
