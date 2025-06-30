export interface CollaboratorPayload {
	collaborators: Array<{
		permission: string
		roles: string[]
		split: string
		user: string
		invitedForProject: string
	}>
	type: string
	ownerRoles: string[]
	split: string
}
