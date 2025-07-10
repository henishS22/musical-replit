export interface Window {
	SpeechRecognition: new () => SpeechRecognition
	webkitSpeechRecognition: new () => SpeechRecognition
}

export interface SpeechRecognitionEvent {
	results: {
		[index: number]: {
			[index: number]: {
				transcript: string
			}
		}
		length: number
		isFinal: boolean
	}
	resultIndex: number
}

export interface SpeechRecognition extends EventTarget {
	continuous: boolean
	interimResults: boolean
	onresult: (event: SpeechRecognitionEvent) => void
	onend: () => void
	onerror: (event: ErrorEvent) => void
	start: () => void
	stop: () => void
}

export interface CreativeAgentModalProps {
	onComplete?: (file: File | null, media_type: string, prompt: string) => void
	title?: string
	description?: string
	icon?: string
	iconBgColor?: string
	placeholder?: string
	inputIcon?: {
		type: "attachment" | "mic" | "combined"
		onClick?: () => void
		onAttachmentClick?: () => void
		onMicClick?: () => void
	}
	isLoading?: boolean
	visualsStep?: number
	mediaType?: string
	overlayModal?: boolean
	overlayType?: "waveform" | "circular"
	selectedAction?: "modify" | "regenerate" | "generate"
	setSelectedAction?: (action: "modify" | "regenerate") => void
}

export interface InputSectionProps {
	isDisabled: boolean
	placeholder: string
	inputIcon?: {
		type: string
		onMicClick?: () => void
		onAttachmentClick?: () => void
	}
	onComplete: (file: File | null, type: string, text: string) => void
	mediaType?: string
	isInvalid?: boolean
	defaultValue?: string
	disabled?: boolean
}
