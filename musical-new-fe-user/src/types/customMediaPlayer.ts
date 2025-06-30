import { StaticImageData } from "next/image"

export interface VideoControlProps {
	icon: string
	alt: string
}

export interface VideoProgressProps {
	isPlaying: boolean
	currentTime: string
	duration: string
	progress: number
	onPlayPause: () => void
}

export interface VideoPlayerHeaderProps {
	authorImage: string | StaticImageData
	authorName: string
	videoTitle: string
}
