export type NotificationType =
	| "ADD_COLLABORATOR"
	| "REMOVE_COLLABORATOR"
	| "CHAT_MESSAGE"
	| "RENAMED_PROJECT"
	| "RENAMED_RELEASE"
	| "ADDED_TRACKS_TO_RELEASE"
	| "REMOVED_TRACKS_FROM_RELEASE"
	| "ADDED_TRACKS_TO_FINAL_VERSION"
	| "REMOVED_TRACKS_FROM_FINAL_VERSION"
	| "COMMENTED_ON_PROJECT"
	| "ADDED_TRACKS_TO_PROJECT"
	| "USER_FOLLOWED_YOU"
	| "UPDATED_RELEASE_SPLITS"
	| "USER_ANSWERED_CONTRACT_SPLIT"
	| "USER_REACTED_TO_ACTIVITY"
	| "USER_COMMENTED_ON_ACTIVITY"
	| "CALL_REQUEST"
	| "PUBLIC_STREAM"
	| "PRIVATE_STREAM"
	| "ACCEPT_INVITATION"
	| "COLLABORATOR_REQ"
	| "COLLABORATOR_ADDED"
	| "COMMENTED_ON_TRACK"
	| "NFT_BUY"
	| "NFT_EXCHANGE_APPROVED"
	| "GAMIFICATION_TOKENS"
	| "MISSION_PERFORMED"
	| "MISSION_COMPLETED"

export interface NotificationUser {
	_id: string
	name: string
	profile_img: string
}

export interface NotificationResource {
	_id: string
	name: string
}

export interface NotificationData {
	_id: string
	type: NotificationType
	from: NotificationUser
	to: NotificationUser
	resource: NotificationResource
	data: {
		eventId?: {
			name: string
			points: number
		}
		scheduleDate?: string
		projectId?: string
		collaboratorName?: string
		message?: string
		oldName?: string
		newName?: string
		release?: {
			name: string
		}
		trackIds?: {
			name: string
			_id: string
		}[]
		tracks?: {
			id: string
			name: string
			duration?: number
		}[]
		identifier?: string
		activityId?: string
		comment?: string
		trackId?: {
			name: string
		}
		nftId?: {
			title: string
			_id: string
		}
	}
	viewed: boolean
	createdAt: string
	updatedAt: string
}
