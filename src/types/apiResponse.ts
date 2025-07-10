export interface IUser {
	_id: string
	name: string
	profile_img: string | null
}

interface Comment {
	comment: string
	commentedAt: string
	user_id: string
	_id: string
	user: IUser
	replies: {
		comment: string
		commentedAt: string
		user_id: string
		_id: string
		user: IUser
	}[]
}

export interface TrackComment {
	_id: string
	user_id: string
	track_id: string
	duration: {
		from: number
		to: number
	}
	isResolved: boolean
	comments: Comment[]
	createdAt: string
	updatedAt: string
	__v: number
	user: IUser
}

export interface IApiResponseData {
	_id: string
	name: string
	extension: string
	instrument: string[]
	genre: string[]
	tags: string[]
	size: number
	duration: number
	channels: number
	rate: number
	bitrate: number
	createdAt: Date
	updatedAt: Date
	__v: number
	imageWaveBig: string
	imageWaveSmall: string
	user: IUser
	lyrics: string[]
	url: string
	linkedAt: Date
	artwork: string
	trackComments: TrackComment[]
	isAIGenerated?: boolean
}

export interface INft {
	_id: string
	title: string
	artworkUrl: string
	user: IUser
}

// NFT Details interface
interface INftDetails {
	_id: string
	project: string
	user: {
		_id: string
		name: string
		profile_img: string
	}
	title: string
	artworkUrl: string
}

// Main NFT Exchange interface
export interface ExchangeNftList {
	_id: string
	nft: string
	user1_nft_details: INftDetails[]
	user1_details: IUser[]
	user2_nft_details: INftDetails[]
	user2_details: IUser[]
	user1: {
		id: string
		name: string
		profile_img: string
	}
	user2: {
		id: string
		name: string
		profile_img: string
	}
}

export interface StreamSchema {
	_id: string
	title: string
	description: string
	type: string
	accessControl: string
	artworkUrl: string
	scheduleDate: string
	streamId: string
	createdById: {
		name: string
		profile_img: string
		_id: string
	}
	nftIds: string[]
	status: string
	createdAt: string
	updatedAt: string
}

export interface StreamDetails {
	nftIds: string[]
	status: "scheduled" | "live" | "completed"
	_id: string
	title: string
	description: string
	type: "chat_only" | string
	accessControl: "public" | "private"
	artworkUrl: string | null
	isLive: boolean
	createdById: string
	nftId: string[]
	streamId: string
	streamUrl: string
	createdAt: string
	updatedAt: string
	__v: number
	scheduleDate: string
}

export interface CollaborationPostData {
	_id: string
	title: string
	brief: string
	tracks: Array<{
		name: string
		extension: string
		duration: string
		_id: string
		artwork: string
		url: string
	}>
	userId: {
		name: string
		profile_img: string
	}
	seeking: Array<{
		title: {
			en: string
		}
	}>
	styles: Array<{
		title: {
			en: string
		}
	}>
	createdAt: string
	songContest?: {
		title: string
		seeking: Array<{
			title: {
				en: string
			}
		}>
		styles: Array<{
			title: {
				en: string
			}
		}>
		duration: {
			endTo: string
		}
		userId?: {
			name: string
			profile_img: string
		}
	}
	user?: {
		name: string
		profile_img: string
	}
	isFavorite?: boolean
}
