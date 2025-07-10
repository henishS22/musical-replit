export interface ArtworkModalProps {
	artworkUrl?: string
	title?: string
	description?: string
	existingProject?: {
		text?: string
		onClick?: () => void
	}
	newProject?: {
		text?: string
		onClick?: () => void
		isLoading?: boolean
	}
	share?: boolean
	padding?: string
	media?: boolean
	icon?: {
		src: string
		alt: string
		bgColor?: string
	}
	headClasses?: Record<string, string>
	setNext?: (state: boolean) => void
	form?: boolean
	secondaryButton?: boolean
	type?: string
	shareButton?: {
		text: string
		onClick?: () => void
	}
	onFileSelect?: (files: FileList) => void
	modalSteps?: number
}
