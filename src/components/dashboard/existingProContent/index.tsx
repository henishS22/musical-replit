import React, { useEffect, useMemo, useState } from "react"
import { useInView } from "react-intersection-observer"
import { toast } from "react-toastify"
import { StaticImageData } from "next/image"

import { addTracksToProject } from "@/app/api/mutation"
import { fetchProject, fetchProjectList } from "@/app/api/query"
import { CustomInput } from "@/components/ui"
import Savebtn from "@/components/ui/savebtn/savebtn"
import { ADD_COLLAB_MODAL } from "@/constant/modalType"
import { TRACK_ADDED_TO_PROJECT_SUCCESSFULLY } from "@/constant/toastMessages"
import { generateQueryParams } from "@/helpers"
import { ProjectResponse } from "@/types/dashboarApiTypes"
import { Spinner } from "@nextui-org/react"
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query"
import { SearchIcon } from "lucide-react"

import { useDynamicStore, useModalStore, useUserStore } from "@/stores"
import { useDebounce } from "@/hooks/useDebounce"

import { ProjectItem } from "./ProjectItem"
import ViewProjectTracks from "./ViewProjectTracks"

// Define types for the component props
interface ExistingProModalContentProps {
	inputLabel: string
	onSave?: (projectValue: string) => void
}

// Define type for project data
export interface Project {
	_id: string
	name: string
	avatar?: string | undefined
	artworkUrl?: string | StaticImageData
	updatedAt?: string
}

export function ExistingProContent({
	inputLabel
}: ExistingProModalContentProps): JSX.Element {
	const [search, setSearch] = useState<string>("")
	const [selectedProject, setSelectedProject] = useState<Project | null>(null)
	const { user } = useUserStore()
	const { showCustomModal, tempCustomModalData, hideCustomModal } =
		useModalStore()
	const searchQuery = useDebounce(search, 1000)
	const { trackId, removeState, addState, tokenTracks, projectIdFromDetails } =
		useDynamicStore()

	const { data: projectDetails } = useQuery({
		queryKey: ["project", projectIdFromDetails],
		queryFn: () => fetchProject(projectIdFromDetails as string),
		enabled: !!projectIdFromDetails,
		staleTime: 300000
	})

	useEffect(() => {
		if (projectDetails) {
			setSelectedProject(projectDetails)
		}
	}, [projectDetails])

	// Fetch Project List
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isPending: isProjectLoading
	} = useInfiniteQuery({
		queryKey: ["projectList", searchQuery],
		initialPageParam: 1,
		queryFn: ({ pageParam = 1 }) =>
			fetchProjectList(
				user?.id ?? "",
				generateQueryParams({
					visibility: "all",
					page: pageParam.toString(),
					limit: "10",
					onlyOwner: "true",
					...(searchQuery && { search: searchQuery })
				})
			),
		getNextPageParam: (lastPage, allPages) => {
			const totalItems = lastPage?.pagination?.total || 0
			const currentPage = allPages?.length
			return currentPage * 10 < totalItems ? currentPage + 1 : undefined
		},
		staleTime: 20000,
		enabled: Boolean(user?.id)
	})

	const { ref: loadMoreRef, inView } = useInView()

	// Fetch Next Page
	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage()
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

	// Fetch Memoized Project Data
	const projectData = useMemo(() => {
		return data?.pages.flatMap((page) => page?.projects ?? []) || []
	}, [data])

	// Add Tracks to Project
	const { mutate: addTracksToProjectMutation, isPending } = useMutation({
		mutationFn: (payload: { projectId: string; trackIds: string[] }) =>
			addTracksToProject(payload),
		onSuccess: (data) => {
			if (data) {
				toast.success(TRACK_ADDED_TO_PROJECT_SUCCESSFULLY)
				hideCustomModal()
				removeState("trackId")
			}
		}
	})

	//
	const handleSave = () => {
		if (selectedProject) {
			if (tempCustomModalData?.startSolo) {
				addTracksToProjectMutation({
					projectId: selectedProject?._id,
					trackIds: [trackId?.id]
				})
			} else if (tempCustomModalData?.handleNext) {
				tempCustomModalData?.handleNext()
			} else {
				showCustomModal({
					customModalType: ADD_COLLAB_MODAL,
					tempCustomModalData: { selectedProjectId: selectedProject?._id }
				})
			}
		}
	}

	return (
		<div className="px-6 py-4 flex flex-col gap-4">
			{/* Input Label */}
			{tempCustomModalData?.showProjectTracks && selectedProject ? (
				<div className="flex flex-col gap-4">
					<div className="flex gap-1 flex-col">
						<div className=" font-bold text-[14px] leading-[21px] tracking-[-0.015em] text-[#33383F]">
							Project Name
						</div>
						<ProjectItem
							project={selectedProject as ProjectResponse}
							height={40}
							width={40}
							showRemove={true}
							onRemove={() => {
								setSelectedProject(null)
								removeState("tokenProject")
							}}
						/>
					</div>
					<div className="flex flex-col gap-2 max-h-[calc(100vh-460px)] overflow-y-auto overflow-x-hidden scrollbar">
						<div className="font-bold text-[14px] leading-[21px] tracking-[-0.015em] text-[#33383F]">
							Select File
						</div>
						<ViewProjectTracks id={selectedProject?._id} />
					</div>
				</div>
			) : (
				<>
					<div className="flex flex-col gap-1">
						<CustomInput
							type="text"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							startContent={<SearchIcon className="text-gray-500" size={16} />}
							label={inputLabel}
							labelClassName="text-sm font-bold tracking-tighter text-[#33383F] leading-[21px]"
							classname="!border-hoverGray !rounded-lg"
						/>
					</div>
					<div className="max-h-[339px] overflow-y-auto flex flex-col gap-4  scrollbar">
						{isProjectLoading && Boolean(searchQuery) ? (
							<Spinner color="default" size="lg" />
						) : (
							<>
								{projectData?.map((item) => (
									<div key={item?._id}>
										<ProjectItem
											project={item as ProjectResponse}
											onSelect={() => {
												setSelectedProject(item)
												addState("tokenProject", item)
												removeState("tokenTracks")
											}}
											isSelected={item?._id === selectedProject?._id}
										/>
									</div>
								))}
								<div ref={loadMoreRef} className="w-full flex justify-center">
									{isFetchingNextPage && <Spinner color="default" size="lg" />}
								</div>
							</>
						)}
					</div>
				</>
			)}
			{/* Save Button */}
			<div className="absolute bottom-0 right-[47px] w-full max-w-[417px] bg-white pb-[15px] flex justify-end">
				<Savebtn
					isLoading={isPending}
					label={!tempCustomModalData?.startSolo ? "Next" : "Save"}
					onClick={handleSave}
					disabled={
						!selectedProject ||
						(tempCustomModalData?.showProjectTracks && !tokenTracks?.length)
					}
					className="bg-btnColor text-white px-4 py-2 rounded-lg text-[13px] hover:bg-btnColorHover leading-[24px] font-bold tracking-[-0.01em]"
				/>
			</div>
		</div>
	)
}
