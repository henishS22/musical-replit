export interface Forum {
	_id: string
	name: string
	description: string
	createdAt: string
	updatedAt: string
	__v: number
}

export interface TopicComment {
	_id: string
	content: string
	userId: TopicUser
	topic: string
	parentComment: string | null
	replies: TopicComment[]
	createdAt: string
	updatedAt: string
	__v: number
}

export interface TopicUser {
	_id: string
	name: string
	profile_img: string | null
}

export interface Topic {
	_id: string
	title: string
	forumName: string
	description: string
	userId: TopicUser
	viewCount: number
	participants: string[]
	repliesCount: number
	lastReplyFrom: TopicUser | null
	comments: TopicComment[]
	forumId: {
		_id: string
		name: string
	}
	lastActivity: string
	createdAt: string
	updatedAt: string
	__v: number
}
