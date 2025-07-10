import { StaticImageData } from "next/image"

import { ProjectCollaborator, Role } from "./createProjectTypes"

export interface ProjectDataType {
	_id: string
	name: string
	updatedAt: Date
	artworkUrl: StaticImageData | string
	avatar?: string
}

export interface RecentFileType {
	_id: string
	album: string
	artwork: string | StaticImageData
	imageWaveSmall: StaticImageData
	createdAt: Date
	name: string
	url: string
	user: {
		name: string
	}
	duration: number
	extension: string
	isAIGenerated?: boolean
}

export interface CheckEmailResponse {
	data: {
		email: string
		name: string
		profile_img: string | null
		skills: string[]
		_id: string
	}
}

export interface ProjectResponse {
	_id: string
	name: string
	artworkUrl?: string
	collaborators: ProjectCollaborator[]
	isPublic: boolean
	split: number
	splitModel: string
	type: string
	user: {
		_id: string
		name: string
		profile_img: string | null
	}
	createdAt: string
	updatedAt: string
	ownerRoles: Role[]
	coverImageUrl?: string
	isOwner: boolean
	permission: string
}
