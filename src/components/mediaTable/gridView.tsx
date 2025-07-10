import { TRACK_THUMBNAIL } from "@/assets"
import { getMediaType } from "@/helpers"
import { MediaListProps, Track } from "@/types"
import { getTypeColor } from "@/utils"
import {
	Button,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Image,
	Pagination
} from "@nextui-org/react"
import {
	Download,
	Edit,
	Folder,
	MoreVertical,
	Share2,
	Trash
} from "lucide-react"

import { useDynamicStore } from "@/stores"
// import { useModalStore } from "@/stores"
// import useDeleteTrack from "@/hooks/useDeleteTrack"
import { usePaginationData } from "@/hooks/usePaginationData"

import { NoDataFound } from "../ui"

export const MediaGridTable = ({
	mediaItems,
	onAction,
	isLoading,
	folderId
}: MediaListProps) => {
	// const { showCustomModal } = useModalStore()
	// const { mutateDeleteTrack } = useDeleteTrack()
	const { addState } = useDynamicStore()
	const { handlePaginationChange } = usePaginationData()
	// const [page, setPage] = useState(1)
	// const itemsPerPage = 8
	// const pages = Math.ceil(mediaItems?.tracks?.length / itemsPerPage)

	// const currentPageItems = mediaItems?.tracks?.slice(
	// 	(page - 1) * itemsPerPage,
	// 	page * itemsPerPage
	// )

	const handleAction = (action: string, item: Track) => {
		if (onAction) {
			onAction(action, item)
		}
	}
	// const handleDeleteTrack = (id: string) => {
	// 	mutateDeleteTrack(id)
	// }
	const ActionButtons = ({ item }: { item: Track }) => (
		<div className="flex gap-2">
			<Dropdown>
				<DropdownTrigger>
					<Button isIconOnly size="sm" variant="flat">
						<MoreVertical className="w-4 h-4" color="white" />
					</Button>
				</DropdownTrigger>
				<DropdownMenu>
					<DropdownItem
						key="download"
						startContent={<Download className="w-4 h-4" />}
						onPress={() => handleAction("download", item)}
					>
						Download
					</DropdownItem>
					<DropdownItem
						key="move"
						startContent={<Folder className="w-4 h-4" />}
						onPress={() => {
							handleAction("move", item)
						}}
					>
						{folderId ? "Remove from folder" : "Move to folder"}
					</DropdownItem>
					<DropdownItem
						key="share"
						className="share-btn"
						startContent={<Share2 className="w-4 h-4" />}
						onPress={() => handleAction("share", item)}
					>
						Share
					</DropdownItem>
					<DropdownItem
						key="edit"
						startContent={<Edit className="w-4 h-4" />}
						onPress={() => handleAction("edit", item)}
					>
						Edit
					</DropdownItem>
					<DropdownItem
						key="delete"
						startContent={<Trash className="w-4 h-4" />}
						className="text-danger"
						onPress={() => {
							handleAction("delete", item)
						}}
					>
						Delete
					</DropdownItem>
				</DropdownMenu>
			</Dropdown>
		</div>
	)

	return (
		<>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{isLoading ? (
					// Skeleton loading state
					<div className="col-span-full flex justify-center items-center">
						<div className="w-full h-48 bg-gray-200 animate-pulse rounded-lg"></div>
					</div>
				) : mediaItems?.tracks?.length === 0 ? (
					// No data found state
					<div className="col-span-full flex justify-center items-center">
						<NoDataFound />
					</div>
				) : (
					mediaItems?.tracks?.map((item: Track) => (
						<div
							key={item?._id}
							className="p-4 relative cursor-pointer"
							onClick={() => {
								addState("mediaPlayer", {
									item: item,
									audioUrl: item?.url,
									coverUrl: item?.artwork || TRACK_THUMBNAIL,
									title: item?.name || "",
									artist: item?.user?.name || "",
									duration: item?.duration || 0,
									extension: getMediaType(`sample.${item?.extension}`),
									videoUrl: item?.url
								})
							}}
						>
							<div className="relative">
								<Image
									removeWrapper
									src={(item?.artwork || TRACK_THUMBNAIL?.src) as string}
									alt={item?.name}
									className="w-full aspect-video object-cover rounded-lg"
								/>
							</div>
							<div className="mt-4">
								<div
									className={`max-w-fit capitalize rounded-lg padding px-2 py-[2px] font-medium text-[10px] text-white leading-[14px] ${getTypeColor(item?.extension)}`}
								>
									{item?.extension}
								</div>
								<p className="text-sm text-gray-500">{item?.name}</p>
								<div className="mt-4 flex justify-between items-center absolute top-[10px] right-[25px]">
									<ActionButtons item={item} />
								</div>
							</div>
						</div>
					))
				)}
			</div>
			<div className="mt-8 flex justify-end items-center">
				<Pagination
					total={mediaItems?.pagination?.pages || 1}
					page={mediaItems?.pagination?.page || 1}
					onChange={handlePaginationChange}
					showControls
					classNames={{
						cursor: "bg-waveformBlue text-background"
					}}
					color="default"
					variant="light"
				/>
			</div>
		</>
	)
}
