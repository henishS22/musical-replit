export interface Quest {
	_id: string
	name: string
	description?: string
	points: number
	identifier: string
	isAvailable?: boolean
}

export interface CreatorQuestPayload {
	questId?: string
	creatorQuestId?: string
	isPublished?: boolean
	description: string
	metaData: {
		caption: string
		mentions: string[]
		hashtags: string[]
	}
}
