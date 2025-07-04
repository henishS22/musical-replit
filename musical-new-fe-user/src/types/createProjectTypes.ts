import { StaticImageData } from "next/image"

import {
	AutocompleteProps,
	PopoverProps,
	TooltipProps
} from "@nextui-org/react"

import { ProjectDataType } from "./dashboarApiTypes"
import { CountryCode } from "./inviteTypes"
import { ReactNode } from "react"

export interface SectionHeaderProps {
	color: string
	title: string
	actionButton?: {
		text: string
		icon?: string
	}
}

export interface FileDisplayProps {
	fileName?: string
	duration: number
	iconSrc: StaticImageData
	label?: string
	error?: string
	smallWaveformImage?: string | StaticImageData
}

export interface ImageUploadProps {
	onImageUpload: (file: File) => void
	error?: string
	onRemove: () => void
	artworkUrl?: string
	disabled?: boolean
	rawArtworkUrl?: File | null
}

export interface CollaboratorProps {
	name: string
	image: string | StaticImageData
	roles: string[]
	permission: string
	split: string
	showDelete?: boolean
}

export interface ToggleProps {
	isActive: boolean
	label: string
}

export interface PreviewCardProps {
	artworkSrc: StaticImageData | string
	artworkWidth?: number
	artworkHeight?: number
	title: string
	duration: number | string
	avatarSrc: StaticImageData | string
	artistName: string
	containerClassName?: string
	isRotating?: boolean
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	trackId?: any
}

export type TooltipButtonProps = {
	tooltipContent: React.ReactNode // Content for the tooltip
	position?: TooltipProps["placement"] // Dynamic position for the tooltip
}

export interface ToggleOptionProps {
	label?: string
	isActive: boolean
	onClick: () => void
	showTooltip?: boolean
	className?: string
	disabled?: boolean
}

export interface CollaboratorData {
	name: string
	image: string | StaticImageData
	roles?: string[]
	permission: string
	split: string
	showDelete?: boolean
}

export interface CollaboratorRowProps {
	collaborator: CollaboratorData
}

export interface PermissionBadgeProps {
	permission: string
}

export interface Collaborator {
	_id: string
	name: string
	email: string
	image: string | StaticImageData
	roles: string[]
	avatar?: string | undefined
	artworkUrl?: string | undefined
	updatedAt?: Date
}

export interface Role {
	_id: string
	title: string
	type?: string
}

export interface collabDetails {
	name?: string
	image?: string | StaticImageData
	roles?: Role[] | string | string[]
	permission?: string
	split?: number
	userId?: string
	email?: string
	invitedForProject?: boolean
}

export interface Wallet {
	addr: string
	provider: string
}

export interface ProjectCollaborator {
	invitedForProject?: boolean
	permission: string
	roles: Array<{ _id: string; type: string; title: string }>
	split?: number
	user?: {
		_id: string
		name: string
		profile_img: string | null
		wallets?: Wallet[]
	}
}

export interface SearchBarProps {
	maxWidth?: boolean
	emptyContent?: React.ReactNode | string
	header?: boolean
	popoverProps?: Partial<PopoverProps>
	placeholder?: string
	onSearch?: (query: string) => void
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onSelect: (collaborator: collabDetails | any) => void
	options?: Collaborator[] | ProjectDataType[] | CountryCode[]
	isLoading?: boolean
	listboxProps?: AutocompleteProps["listboxProps"]
	startContent?: React.ReactNode
	className?: string
	children?: (
		item: Collaborator | ProjectDataType | CountryCode
	) => React.ReactElement
	inputProps?: AutocompleteProps["inputProps"]
	classNames?: AutocompleteProps["classNames"]
	isVirtualized?: boolean
	radius?: AutocompleteProps["radius"]
	variant?: AutocompleteProps["variant"]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SetValue = (name: any, value: any) => void

export interface CollaboratorSectionProps {
	setValue: SetValue
}

export interface CollaboratorTableProps {
	setValue: SetValue
	collaborator: collabDetails[]
}

export interface AddCollaboratorProps {
	setCollaborators: (collaborator: collabDetails) => void
}

export interface UserDetail {
	_id: string
	name: string
	email: string
	profile_img: string | null
	// Add other properties as needed
}

export type selectedUser = {
	name: string
	image: string | StaticImageData
	roles?: string[]
	permission?: string
	split?: number
	userId?: string
	_id?: string
}

export interface TrackResponse {
	_id: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any
}
