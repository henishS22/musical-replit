import { StaticImageData } from "next/image"

export interface ChatMessage {
	id: string
	user: {
		name: string
		image: string | StaticImageData
	}
	created_at: string
	text: string
}
