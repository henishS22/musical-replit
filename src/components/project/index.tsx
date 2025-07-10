"use client"

import { useState } from "react"
import { toast } from "react-toastify"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { deleteProject } from "@/app/api/mutation"
import { fetchProjectList } from "@/app/api/query"
import { PROFILE_IMAGE, PROJECT_IMAGE, TIME_IMAGE } from "@/assets"
import { projectListHeaders } from "@/constant/tableHeaders/projectList"
import { generateQueryParams } from "@/helpers"
import { ProjectResponse } from "@/types/dashboarApiTypes"
import {
	Button,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger
} from "@nextui-org/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Edit, Eye, MoreVertical, Trash } from "lucide-react"

import { useDynamicStore, useUserStore } from "@/stores"

import { TitleBadgeCard } from "../ui"
import CustomTable from "../ui/customTable"

export const ProjectContent = () => {
	const router = useRouter()
	const { user } = useUserStore()

	const { removeState } = useDynamicStore()
	const queryClient = useQueryClient()

	const [tablePagination, setTablePagination] = useState({
		page: 1,
		limit: 10
	})

	const handlePaginationChange = (page: number) => {
		setTablePagination({
			...tablePagination,
			page
		})
	}

	const { data: projectData, isPending: isProjectLoading } = useQuery({
		queryKey: ["projectList", tablePagination?.page],
		queryFn: () =>
			fetchProjectList(
				user?.id ?? "",
				generateQueryParams({
					visibility: "all",
					page: tablePagination?.page || 1,
					limit: tablePagination?.limit || 10
				})
			),
		staleTime: 20000,
		enabled: Boolean(user?.id)
	})

	const { mutate } = useMutation({
		mutationFn: async (projectId: string) => await deleteProject(projectId),

		onSuccess: () => {
			toast.success("Project deleted successfully")
			queryClient.invalidateQueries({ queryKey: ["projectList"] })
		},
		onError: (error) => {
			console.error("Delete project failed:", error)
		}
	})

	const handleCreateProject = () => {
		removeState("collabData")
		removeState("trackId")
		router.push("/create-project")
	}

	const ActionButtons = ({ id, isOwner }: { id: string; isOwner: boolean }) => (
		<div className="flex gap-2">
			<Dropdown>
				<DropdownTrigger>
					<Button isIconOnly size="sm" variant="flat">
						<MoreVertical className="w-4 h-4" />
					</Button>
				</DropdownTrigger>
				<DropdownMenu>
					<DropdownItem
						key="view"
						startContent={<Eye className="w-4 h-4" />}
						onPress={() => {
							router.push(`/project/${id}`)
						}}
					>
						View Project
					</DropdownItem>

					{isOwner ? (
						<DropdownItem
							key="edit"
							startContent={<Edit className="w-4 h-4" />}
							onPress={() => {
								removeState("trackId")
								removeState("collabData")
								router.push(`/create-project/${id}`)
							}}
						>
							Edit
						</DropdownItem>
					) : null}

					{isOwner ? (
						<DropdownItem
							key="delete"
							startContent={<Trash className="w-4 h-4" />}
							className="text-danger"
							onPress={() => {
								mutate(id)
							}}
						>
							Delete
						</DropdownItem>
					) : null}
				</DropdownMenu>
			</Dropdown>
		</div>
	)

	const handleRowClick = (item: ProjectResponse) => {
		router.push(`/project/${item._id}`)
	}

	const renderRow = (
		item: ProjectResponse,
		columnKey: keyof ProjectResponse
	) => {
		switch (columnKey) {
			case "name":
				return (
					<div className="flex items-center gap-4">
						<Image
							src={item?.artworkUrl || PROJECT_IMAGE}
							alt="project-image"
							width={54}
							height={54}
						/>
						<div>{item?.name}</div>
					</div>
				)
			case "collaborators":
				return (
					<div className="flex gap-2 flex-wrap">
						{item?.collaborators.map((collab) => (
							<Image
								key={collab?.user?._id}
								src={collab?.user?.profile_img || PROFILE_IMAGE}
								alt="collab-image"
								width={44}
								height={44}
								className="w-10 h-10 rounded-full"
							/>
						))}
					</div>
				)
			case "updatedAt":
				return (
					<div className="flex gap-2 flex-wrap">
						<Image src={TIME_IMAGE} alt="time-image" />
						<div>
							{new Date(item?.updatedAt)
								.toLocaleString("en-US", {
									month: "short",
									day: "2-digit",
									hour: "2-digit",
									minute: "2-digit",
									hour12: false
								})
								.replace(",", " |")}
						</div>
					</div>
				)
			default:
				return <ActionButtons id={item._id} isOwner={item.isOwner} />
		}
	}

	return (
		<div className="p-6 min-h-[6	00px]">
			<TitleBadgeCard
				title="All Projects"
				markColor="#B1E5FC"
				subComponent={
					<div className="flex justify-between">
						<Button
							className="bg-btnColor text-white px-4 py-2 rounded-lg text-base hover:bg-btnColorHover"
							onPress={handleCreateProject}
						>
							+ Create New Project
						</Button>
					</div>
				}
			>
				<CustomTable
					headers={projectListHeaders}
					data={projectData?.projects || []}
					totalPages={projectData?.pagination?.pages || 0}
					currentPage={projectData?.pagination?.page || 1}
					onPageChange={handlePaginationChange}
					isLoading={isProjectLoading}
					renderRow={renderRow}
					onRowClick={handleRowClick}
				/>
			</TitleBadgeCard>
		</div>
	)
}
