import { Header } from "@/types/customTableTypes"
import { ProjectResponse } from "@/types/dashboarApiTypes"

export const projectListHeaders: Header<ProjectResponse>[] = [
	{
		title: "Project Name",
		key: "name" as keyof ProjectResponse
	},
	{
		title: "Collaborators",
		key: "collaborators" as keyof ProjectResponse
	},
	{
		title: "Last Updated",
		key: "updatedAt" as keyof ProjectResponse
	},

	{
		title: "Action",
		key: "action" as keyof ProjectResponse
	}
]
