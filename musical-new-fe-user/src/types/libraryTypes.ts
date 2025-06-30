// Define the type for a tag object
export interface Tag {
	_id: string
	definition: string
	title: string
}

// Define the type for an instrument object
export interface Instruments {
	_id: string
	type: string
	title: string
	instrument: string
}

export interface FolderMovePayload {
	folder_id: string | null
	track_id?: string
}

// Define the type for a genre object
export interface Genre {
	_id: string
	style: string
	title: string
	instrument: string | null
}
export interface MediaGenre {
	_id: string
	style: string
	title: {
		en: string
		es: string
	}
	instrument: string | null
}

export interface Category {
	value: string
	label: string
}
