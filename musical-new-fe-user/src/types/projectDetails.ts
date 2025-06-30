import { Track } from "./mediaTableTypes"

export interface Application {
	brief: string

	_id: string // Unique identifier for the application
	user: {
		profile_img: string // URL to the user's profile image
		name: string // User's name
		_id: string // Unique identifier for the user
	}
	tracks: Track[]
	isFavorite: boolean
	isArchived: boolean
}

export interface MessageUser {
	id: string
	name: string
	image: string
}

export interface Message {
	id: string
	text: string
	user: MessageUser
	cid: string
	created_at: string
	updated_at: string
}
