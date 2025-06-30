import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"

import { updateTrack } from "@/app/api/mutation"
import { downloadTrack } from "@/app/api/query"
import {
	CONFIRMATION_MODAL,
	FILTER_MODAL,
	MOVE_FILE_MODAL,
	PURCHASE_SUBSCRIPTION_MODAL,
	SCHEDULE_POST_MODAL
} from "@/constant/modalType"
import { FILE_MOVED_SUCCESSFULLY } from "@/constant/toastMessages"
import { FolderMovePayload, MediaListProps, Track } from "@/types"
import {
	Button,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger
} from "@nextui-org/react"
import { useMutation, useQuery } from "@tanstack/react-query"
import {
	Filter,
	SortDesc
	// Play,
} from "lucide-react"

import { useDynamicStore, useModalStore, useUserStore } from "@/stores"
import useDeleteTrack from "@/hooks/useDeleteTrack"
import useFolderMediaList from "@/hooks/useFolderMediaList"

// import { MediaPlayer } from "../mediaPlayer"
import { MediaTable } from "../mediaTable"
import { FilterModal } from "../modal/filterModal"
import GridBtn from "../ui/gridBtn/gridBtn"

export function MediaList({
	mediaItems,
	isLoading,
	folderId = ""
}: MediaListProps) {
	const { showCustomModal, hideCustomModal } = useModalStore()
	const { addState, removeState, mediaPlayer, schedulePostData } =
		useDynamicStore()
	const { subscriptionFeatures } = useUserStore()
	const isSubscribed = subscriptionFeatures?.[8]?.available
	const router = useRouter()

	const { mutateDeleteTrack, isLoading: isDeleteLoading } = useDeleteTrack()
	const { fetchMediaContentList } = useFolderMediaList()
	const { mutate } = useMutation({
		mutationFn: (payload: FolderMovePayload) =>
			updateTrack(payload.track_id || "", { folder_id: null }),
		onSuccess: (data) => {
			if (data) {
				fetchMediaContentList(folderId)
				toast.success(FILE_MOVED_SUCCESSFULLY)
			}
		},
		onError: (error: Error) => {
			if (error instanceof Error) {
				toast.error("Error: " + error.message)
			} else {
				toast.error("An unknown error occurred.")
			}
		}
	})

	const [trackData, setTrackData] = useState<{
		_id: string
		name: string
		extension: string
	} | null>(null)
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

	const { refetch, isFetching } = useQuery({
		queryKey: ["download", trackData?._id],
		queryFn: () =>
			downloadTrack(
				trackData?._id || "",
				trackData?.name || "",
				trackData?.extension || ""
			),
		enabled: false
	})

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleApplyFilters = (filters: any) => {
		addState("tracksFilterData", {
			filters
		})
		hideCustomModal()
	}
	useEffect(() => {
		addState("tracksSortData", {
			sortOrder
		})
	}, [sortOrder, addState])

	const handleShare = (item: Track) => {
		if (!isSubscribed) {
			return showCustomModal({
				customModalType: PURCHASE_SUBSCRIPTION_MODAL
			})
		}
		addState("trackId", item)
		addState("isShare", false)
		if (!schedulePostData?.isSchedulePost) {
			removeState("chips")
			router.push("/post-audio-or-video")
		} else {
			showCustomModal({
				customModalType: SCHEDULE_POST_MODAL,
				tempCustomModalData: item
			})
		}
	}

	const handleEdit = (item: Track) => {
		removeState("linkTrack")
		removeState("isReleaseTrack")
		router.push(`/upload-new-work/${item?._id}`)
	}

	const handleDelete = (item: Track) => {
		showCustomModal({
			customModalType: CONFIRMATION_MODAL,
			modalFunction: () => mutateDeleteTrack(item?._id as string),
			tempCustomModalData: {
				title: "Delete",
				msg: "Are you sure want to delete?",
				isLoading: isDeleteLoading
			}
		})
	}

	const handleMove = (item: Track) => {
		if (folderId) {
			const payload = {
				folder_id: null,
				track_id: item._id || ""
			}
			mutate(payload)
		} else {
			showCustomModal({
				customModalType: MOVE_FILE_MODAL,
				tempCustomModalData: item
			})
		}
	}

	useEffect(() => {
		removeState("mediaPlayer")
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-xl font-bold">All Songs and Videos</h2>
				<div className="flex gap-2">
					{/* View toggle buttons */}
					<GridBtn />

					<Dropdown>
						<DropdownTrigger>
							<Button
								variant="flat"
								startContent={<SortDesc className="w-4 h-4" />}
							>
								Sort By: {sortOrder === "asc" ? "Ascending" : "Descending"}
							</Button>
						</DropdownTrigger>
						<DropdownMenu
							aria-label="Sort options"
							onAction={(key) => setSortOrder(key as "asc" | "desc")}
						>
							<DropdownItem key="asc">Ascending</DropdownItem>
							<DropdownItem key="desc">Descending</DropdownItem>
						</DropdownMenu>
					</Dropdown>
					<Button
						variant="flat"
						startContent={<Filter className="w-4 h-4" />}
						onPress={() => showCustomModal({ customModalType: FILTER_MODAL })}
					>
						Filter
					</Button>
				</div>
			</div>

			<FilterModal onApplyFilters={handleApplyFilters} />
			<MediaTable
				mediaItems={mediaItems}
				isLoading={isLoading}
				className={mediaPlayer ? "pb-[78px]" : ""}
				folderId={folderId}
				onAction={(action, item) => {
					switch (action) {
						case "download":
							if (!isFetching) {
								setTrackData({
									_id: String(item._id),
									name: item.name,
									extension: item.extension
								})
								refetch()
							}
							break
						case "share":
							handleShare(item)
							break
						case "edit":
							handleEdit(item)
							break
						case "delete":
							handleDelete(item)
							break
						case "move":
							handleMove(item)
							break
					}
				}}
			/>

			{/* {mediaPlayer && (
				<MediaPlayer
					onClose={() => {
						removeState("mediaPlayer")
					}}
				/>
			)} */}
		</div>
	)
}
