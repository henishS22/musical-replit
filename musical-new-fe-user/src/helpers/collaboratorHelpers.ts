import { collabDetails, ProjectCollaborator } from "@/types"

import {
	PERMISSION_DISPLAY_MAP,
	REVERSE_PERMISSION_MAP
} from "@/config/addCollab"

export const formatCollaborators = (
	collaborators: ProjectCollaborator[] = []
) => {
	return collaborators?.map((collab) => ({
		userId: collab?.user?._id,
		name: collab?.user?.name,
		image: collab?.user?.profile_img,
		permission:
			PERMISSION_DISPLAY_MAP[
				collab?.permission as keyof typeof PERMISSION_DISPLAY_MAP
			] || "",
		split: collab?.split,
		roles: collab?.roles?.map((role) => role?._id) || []
	}))
}

export const formatUpdatePayload = (
	collaborators: collabDetails[]
): Record<string, string | number | object> => {
	const ownerCollaborator = collaborators.find(
		(collab) =>
			REVERSE_PERMISSION_MAP[
				collab?.permission as keyof typeof REVERSE_PERMISSION_MAP
			] === "OWNER"
	)

	const nonOwnerCollaborators = collaborators.slice(1)
	return {
		collaborators: nonOwnerCollaborators?.map((collab: collabDetails) => ({
			permission:
				REVERSE_PERMISSION_MAP[
					collab?.permission as keyof typeof REVERSE_PERMISSION_MAP
				] || "",
			roles: collab?.roles || [],
			split: collab?.split?.toString() || "",
			...(collab?.invitedForProject
				? {
						email: collab?.email,
						invitedForProject: collab?.invitedForProject.toString()
					}
				: {
						user: collab?.userId || ""
					})
			// invitedForProject: "false"
		})),
		type: "SINGLE",
		ownerRoles: ownerCollaborator?.roles || [],
		split: ownerCollaborator?.split?.toString() || ""
	}
}
