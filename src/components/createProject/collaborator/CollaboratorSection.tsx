import * as React from "react"

import { fetchUserList } from "@/app/api/query"
import { CustomSearchbar, TitleBadgeCard } from "@/components/ui"
import { generateQueryParams } from "@/helpers"
import {
	AddCollaboratorProps,
	collabDetails,
	CollaboratorSectionProps,
	selectedUser,
	UserDetail
} from "@/types/createProjectTypes"
import { Button } from "@nextui-org/react"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"

import { useUserStore } from "@/stores"
import { useDebounce } from "@/hooks/useDebounce"

import CollaboratorTable from "./CollaboratorTable"
import EmptyContent from "./emptyContent"

const AddCollaborator: React.FC<AddCollaboratorProps> = ({
	setCollaborators
}) => {
	const [searchText, setSearchText] = React.useState<string>("")
	const [selectedCollaborator, setSelectedCollaborator] =
		React.useState<selectedUser | null>(null)

	// Use the useDebounce hook to prevent frequent API calls
	const debouncedText = useDebounce(searchText || "", 500)
	const { userData } = useUserStore()

	// Fetch users based on debounced search text
	const { data = [], isPending } = useQuery<UserDetail[]>({
		queryKey: ["roles", debouncedText, userData],
		queryFn: () =>
			fetchUserList(
				generateQueryParams({ skills: true, search: debouncedText })
			),
		staleTime: 20000,
		enabled: !!userData?._id // Ensure the query runs only if userData is available
	})

	// Map UserDetail to Collaborator
	const collaborators = data?.map((user) => ({
		_id: user?._id,
		name: user?.name,
		email: user?.email,
		image: user?.profile_img || "", // Provide a default image or fetch it if available
		roles: [], // Provide default roles or fetch them if available
		permission: "View only", // Set a default permission
		split: 0 // Set a default split
	}))

	const handleSelect = (collaborator: selectedUser) => {
		setSelectedCollaborator(collaborator)
	}

	const handleAddCollaborator = () => {
		if (selectedCollaborator) {
			const collaboratorDetails: collabDetails = {
				name: selectedCollaborator.name || "Unknown",
				image: selectedCollaborator.image || "",
				userId: selectedCollaborator._id || ""
			}
			setCollaborators(collaboratorDetails)
		}
	}

	return (
		<div className="flex gap-1 items-center">
			<CustomSearchbar
				placeholder="Type a name or email"
				onSearch={(text) => setSearchText(text || "")}
				onSelect={handleSelect}
				options={
					collaborators.filter((user) => user._id !== userData?._id) || []
				}
				isLoading={isPending}
				emptyContent={
					isPending ? (
						"Searching..."
					) : (
						<EmptyContent
							setCollaborators={setCollaborators}
							searchText={searchText}
							setSearchText={setSearchText}
						/>
					)
				}
			/>
			<Button
				className="p-2 text-[#1A1D1F] bg-white rounded-md text-[13px] font-bold flex gap-1 border-2 border-[#EFEFEF] items-center"
				onPress={handleAddCollaborator}
			>
				<Plus size={16} strokeWidth={0.75} /> Add
			</Button>
		</div>
	)
}

const CollaboratorSection: React.FC<CollaboratorSectionProps> = ({
	setValue
}) => {
	const [collaborators, setCollaborators] = React.useState<collabDetails[]>([])

	const handleAddCollaborator = (collaborator: collabDetails) => {
		if (collaborator) {
			setCollaborators([collaborator])
		}
	}

	return (
		<TitleBadgeCard
			markColor="#8A8A8A"
			title="Collaborator"
			subComponent={
				<AddCollaborator setCollaborators={handleAddCollaborator} />
			}
		>
			<CollaboratorTable setValue={setValue} collaborator={collaborators} />
		</TitleBadgeCard>
	)
}

export default CollaboratorSection
