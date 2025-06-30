import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import Image from "next/image"

import { fetchCollaborationRole } from "@/app/api/query"
import { PROFILE_IMAGE } from "@/assets"
import MultiSelectDropdown from "@/components/ui/dropdown/MultiSelectDropdown"
import RadioDropdown from "@/components/ui/dropdown/RadioDropdown"
import { CollaboratorTableProps, Role } from "@/types"
import {
	Spinner,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow
} from "@nextui-org/react"
import { useQuery } from "@tanstack/react-query"
import { X } from "lucide-react"

import { permissionOptions } from "@/config"
import { useDynamicStore, useUserStore } from "@/stores"

const CollaboratorTable: React.FC<CollaboratorTableProps> = ({
	setValue: setFormValue,
	collaborator = []
}) => {
	const { collabData } = useDynamicStore()
	const { userData: userDetails } = useUserStore()

	// Initial collaborator data with fallback values
	const [data, setData] = useState([
		{
			name: userDetails?.name || "Unknown User",
			userId: userDetails?._id || "",
			image: userDetails?.profile_img || PROFILE_IMAGE,
			permission: "Owner",
			split: 100,
			roles: [""]
		}
	])

	const {
		setError,
		clearErrors,
		watch,
		setValue,
		trigger,
		formState: { errors }
	} = useForm({
		defaultValues: {
			collaborators: data
		},
		mode: "onBlur"
	})

	const collaborators = watch("collaborators") || []

	// Update parent component when collaborators change
	useEffect(() => {
		setFormValue?.("collaborators", collaborators)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [collaborators])

	// Set initial collaborator from userDetails without duplication
	useEffect(() => {
		setValue("collaborators", [])
		if (
			userDetails?.name &&
			collaborators.length < 2 &&
			!collabData?.formattedCollaborators?.length &&
			!collabData?.isProjectLoading
		) {
			const userData = [
				{
					name: userDetails.name || "Unknown User",
					userId: userDetails._id || "",
					image: userDetails?.profile_img || PROFILE_IMAGE,
					permission: "Owner",
					split: 100,
					roles: []
				}
			]
			setData(userData)
			setValue("collaborators", userData)
			trigger("collaborators") // Ensure re-render
		} else {
			setData(collabData?.formattedCollaborators)
			setValue("collaborators", collabData?.formattedCollaborators)
			trigger("collaborators") // Ensure re-render
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userDetails, collabData?.formattedCollaborators])

	// Add external collaborators, avoiding duplicates
	useEffect(() => {
		if (collaborator?.length > 0) {
			const newCollaborators = collaborator
				.filter(
					(collab) =>
						!collaborators.some(
							(existing) => existing?.userId === collab?.userId
						)
				)
				.map((collab) => ({
					name: collab?.name || "Invited",
					image: collab?.image || PROFILE_IMAGE,
					permission: "View only",
					split: 0,
					userId: collab?.userId || "",
					roles: [],
					...(collab.invitedForProject
						? {
								invitedForProject: collab.invitedForProject,
								email: collab.email
							}
						: {})
				}))
			setValue("collaborators", [...collaborators, ...newCollaborators])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [collaborator])

	// Handle split updates with validation
	const handleSplitChange = (index: number, value: number) => {
		const totalSplitWithoutCurrent = collaborators.reduce(
			(acc, collaborator, i) =>
				acc + (i === index ? 0 : collaborator?.split || 0),
			0
		)

		const maxAllowed = 100 - totalSplitWithoutCurrent

		if (value > maxAllowed) {
			setError(`collaborators.${index}.split`, {
				type: "manual",
				message: `Split cannot exceed ${maxAllowed}%`
			})
		} else {
			clearErrors(`collaborators.${index}.split`)
			const updatedCollaborators = [...collaborators]
			updatedCollaborators[index].split = value
			setValue("collaborators", updatedCollaborators)
		}
	}

	// Fetch roles with safe data fallback
	const { data: roles = [] } = useQuery({
		queryKey: ["collabRoles"],
		queryFn: () => fetchCollaborationRole("en"),
		staleTime: 20000
	})

	return (
		<Table
			isStriped
			aria-label="Collaborators Table"
			className="mt-8"
			removeWrapper
		>
			<TableHeader>
				<TableColumn width="188">Name</TableColumn>
				<TableColumn width="288">Role</TableColumn>
				<TableColumn width="120">Permission</TableColumn>
				<TableColumn width="64">Split</TableColumn>
			</TableHeader>
			<TableBody
				loadingState={collabData?.isProjectLoading ? "loading" : "idle"}
				loadingContent={<Spinner size="lg" color="default" />}
			>
				{collaborators.map((collaborator, index) => (
					<TableRow key={index}>
						<TableCell>
							<div className="flex items-center gap-2">
								<Image
									loading="lazy"
									src={collaborator?.image || PROFILE_IMAGE}
									className="object-contain rounded-full w-8 h-8"
									alt={`${collaborator?.name || "User"}'s avatar`}
									width={32}
									height={32}
								/>
								{collaborator?.name || "Invited"}
							</div>
						</TableCell>
						<TableCell>
							<MultiSelectDropdown
								options={
									roles?.map((role: Role) => ({
										key: role?._id || "",
										label: role?.title || "Untitled Role"
									})) || []
								}
								selectedValues={collaborator?.roles || []}
								onSelectionChange={(updatedRoles) => {
									const updatedCollaborators = [...collaborators]
									updatedCollaborators[index].roles = updatedRoles
									setValue("collaborators", updatedCollaborators)
								}}
							/>
						</TableCell>
						<TableCell>
							<RadioDropdown
								options={permissionOptions}
								selectedValue={collaborator?.permission || "View only"}
								onSelectionChange={(updatedPermission) => {
									const updatedCollaborators = [...collaborators]
									updatedCollaborators[index].permission = updatedPermission
									setValue("collaborators", updatedCollaborators)
								}}
								disable={collaborator?.userId === userDetails?._id}
							/>
						</TableCell>
						<TableCell>
							<div className="flex gap-2 items-center">
								<div className="w-[44px] h-[24px] px-[8px] rounded-[4px] bg-[#CABDFF] flex items-center split-input text-xs font-semibold">
									<input
										type="number"
										min={0}
										max={100}
										value={collaborator?.split || ""}
										className="w-[22px] bg-transparent border-none outline-none text-black placeholder-gray-500"
										placeholder="0"
										onChange={(e) => {
											const newSplit = parseInt(e.target.value, 10) || 0
											handleSplitChange(index, newSplit)
										}}
									/>
									<span className="text-black text-sm">%</span>
								</div>

								{index > 0 && (
									<X
										size={16}
										strokeWidth={0.75}
										className="cursor-pointer"
										onClick={() => {
											const removedCollaborator = collaborators[index]
											const updatedCollaborators = collaborators.filter(
												(_, idx) => idx !== index
											)

											// Find the owner and transfer the split
											const ownerIndex = updatedCollaborators.findIndex(
												(collab) => collab.permission === "Owner"
											)

											if (ownerIndex !== -1) {
												updatedCollaborators[ownerIndex].split +=
													removedCollaborator.split
											}
											setValue("collaborators", updatedCollaborators)
										}}
									/>
								)}
							</div>

							{errors?.collaborators?.[index]?.split && (
								<span className="text-red-500 text-xs">
									{errors?.collaborators?.[index]?.split?.message}
								</span>
							)}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}

export default CollaboratorTable
