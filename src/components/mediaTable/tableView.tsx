import { memo, useCallback, useEffect, useState } from "react"
import Joyride from "react-joyride"
import { StaticImageData } from "next/image"

import { TRACK_THUMBNAIL } from "@/assets"
import ChatPopIcon from "@/assets/icons/ChatPopIcon"
import { headers } from "@/constant/tableHeaders/mediaTable"
import { getMediaType } from "@/helpers"
// import { getMediaType } from "@/helpers"
import { Instrument, MediaGenre, MediaListProps, Track } from "@/types"
import {
	Button,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Tooltip
} from "@nextui-org/react"
import {
	Download,
	Edit,
	FolderMinus,
	MoreVertical,
	Share2,
	Trash
} from "lucide-react"

import { useDynamicStore } from "@/stores"
import { usePaginationData } from "@/hooks/usePaginationData"

import TrackCard from "../createOpportunity/TrackCard"
import CustomTable from "../ui/customTable"

export const MediaListTable = ({
	mediaItems,
	onAction,
	isLoading,
	folderId
}: MediaListProps) => {
	const { handlePaginationChange } = usePaginationData()
	const { addState, isShare } = useDynamicStore()
	const [runTour, setRunTour] = useState(false)

	// Get first item ID once
	const firstItemId = mediaItems?.tracks?.[0]?._id

	const steps = [
		{
			target: `[data-share-id='${firstItemId}']`,
			content: "Please Click here for share!",
			disableBeacon: true
			// placement: "top"
		}
	]

	const handleAction = useCallback(
		(action: string, item: Track) => {
			if (onAction) {
				onAction(action, item)
			}
		},
		[onAction]
	)

	useEffect(() => {
		if (isShare && firstItemId) {
			const checkAndStartTour = () => {
				const target = document.querySelector(
					`[data-share-id='${firstItemId}']`
				)

				if (target) {
					setRunTour(true)
				} else {
					// If target not found and we haven't exceeded max retries
					setTimeout(checkAndStartTour, 500)
				}
			}

			const timer = setTimeout(checkAndStartTour, 300)

			return () => {
				clearTimeout(timer)
				setRunTour(false)
			}
		} else {
			setRunTour(false)
		}
	}, [isShare, firstItemId])

	const ActionButtons = memo(({ item }: { item: Track }) => {
		return (
			<div className="flex gap-2">
				<Button
					isIconOnly
					size="sm"
					variant="flat"
					onPress={() => handleAction("download", item)}
				>
					<Download className="w-4 h-4" />
				</Button>
				<Tooltip content="Post to Social" placement="top">
					<Button
						isIconOnly
						size="sm"
						variant="flat"
						className="share-btn"
						data-share-id={mediaItems?.tracks?.[0]?._id}
						onPress={() => handleAction("share", item)}
					>
						<Share2 className="w-4 h-4" />
					</Button>
				</Tooltip>
				<Dropdown>
					<DropdownTrigger>
						<Button isIconOnly size="sm" variant="flat">
							<MoreVertical className="w-4 h-4" />
						</Button>
					</DropdownTrigger>
					<DropdownMenu>
						<DropdownItem
							key="edit"
							startContent={<Edit className="w-4 h-4" />}
							onPress={() => handleAction("edit", item)}
						>
							Edit
						</DropdownItem>
						<DropdownItem
							key="move"
							startContent={<FolderMinus className="w-4 h-4" />}
							onPress={() => handleAction("move", item)}
						>
							{folderId ? "Remove from folder" : "Move to folder"}
						</DropdownItem>
						<DropdownItem
							key="delete"
							startContent={<Trash className="w-4 h-4" />}
							className="text-danger"
							onPress={() => handleAction("delete", item)}
						>
							Delete
						</DropdownItem>
						<DropdownItem key="AI modal" startContent={<ChatPopIcon />}>
							Add to AI model
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>
			</div>
		)
	})
	ActionButtons.displayName = "ActionButtons"

	const renderRow = useCallback(
		(item: Track, columnKey: keyof Track) => {
			switch (columnKey) {
				case "name":
					return (
						<div
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
							className="cursor-pointer min-w-[350px]"
						>
							<TrackCard
								track={item}
								bgClass="bg-transparent w-[85%] px-0"
								key={item?._id}
								trackurl={item?.url || ""}
								mediaSrc={item?.imageWaveSmall || ""}
								imageSrc={
									(item?.artwork || TRACK_THUMBNAIL) as string | StaticImageData
								}
								title={item?.name || ""}
								extension={item?.extension || ""}
								artist={item?.user?.name || ""}
								duration={item?.duration || 0}
								showWaveform={false}
								isMuted={true}
								playIcon={false}
								isAIGenerated={item?.isAIGenerated}
							/>
						</div>
					)
				case "genre":
					return (
						<div className="flex gap-2 flex-wrap">
							{item?.genre?.length > 0 ? (
								item?.genre?.map((genre: MediaGenre, idx: number) => (
									<span
										key={idx}
										className="px-2 py-1 rounded-full bg-[#398FFF] text-white text-sm"
									>
										{genre?.title?.en}
									</span>
								))
							) : (
								<span className="px-2 py-1 rounded-full bg-gray-200 text-sm">
									No Genre
								</span>
							)}
						</div>
					)
				case "instrument":
					return (
						<div className="flex gap-2 flex-wrap">
							{item?.instrument?.length > 0 ? (
								item?.instrument?.map((instrument: Instrument, idx: number) => (
									<span
										key={idx}
										className="px-2 py-1 rounded-full bg-gray-200 text-sm"
									>
										{instrument?.title?.en}
									</span>
								))
							) : (
								<span className="px-2 py-1 rounded-full bg-gray-200 text-sm">
									No Instrument
								</span>
							)}
						</div>
					)
				default:
					return <ActionButtons item={item} />
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[addState, ActionButtons]
	)

	return (
		<>
			{isShare && firstItemId && (
				<Joyride
					steps={steps}
					run={runTour}
					continuous={true}
					showSkipButton={true}
					disableOverlayClose={true}
					disableScrolling
					hideCloseButton={false}
					spotlightClicks={false}
					styles={{
						options: {
							zIndex: 10000
						}
					}}
					locale={{
						last: "OK",
						skip: "Skip"
					}}
					callback={(data) => {
						if (data.status === "finished" || data.status === "skipped") {
							setRunTour(false)
						}
					}}
				/>
			)}
			<CustomTable
				headers={headers}
				data={mediaItems?.tracks || headers}
				totalPages={mediaItems?.pagination?.pages || 1}
				currentPage={mediaItems?.pagination?.page || 1}
				onPageChange={handlePaginationChange}
				isLoading={isLoading}
				renderRow={renderRow}
			/>
		</>
	)
}
