import { useEffect, useMemo, useState } from "react"
import { useInView } from "react-intersection-observer"
import { StaticImageData } from "next/image"

import { fetchRecentTrack } from "@/app/api/query"
import { TRACK_THUMBNAIL } from "@/assets"
import TrackCard from "@/components/createOpportunity/TrackCard"
import { CustomInput } from "@/components/ui"
import Savebtn from "@/components/ui/savebtn/savebtn"
import { generateQueryParams } from "@/helpers"
import { formatDate } from "@/helpers/common"
import { fetchTrack } from "@/types/createOpportunityTypes"
import { Spinner } from "@nextui-org/react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { SearchIcon } from "lucide-react"

import { useDebounce } from "@/hooks/useDebounce"

interface TrackSelectionContentProps {
	onSubmit?: (data: fetchTrack[]) => void
	initialData?: fetchTrack[]
	onClose: () => void
	singleSelect?: boolean
}

const TrackSelectionContent = ({
	onSubmit,
	initialData,
	onClose,
	singleSelect = false
}: TrackSelectionContentProps) => {
	const [selectedTrackIds, setSelectedTrackIds] = useState<fetchTrack[]>(
		initialData || []
	)
	const [search, setSearch] = useState("")
	const debouncedSearch = useDebounce(search, 1000)

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
		useInfiniteQuery({
			queryKey: ["recent-tracks", debouncedSearch],
			queryFn: ({ pageParam = 1 }) => {
				return fetchRecentTrack(
					generateQueryParams({
						page: pageParam.toString(),
						limit: "10",
						search: debouncedSearch
					})
				)
			},
			initialPageParam: 1,
			getNextPageParam: (lastPage, allPages) => {
				const totalItems = lastPage?.pagination?.total || 0
				const currentPage = allPages.length
				const nextPage = currentPage + 1
				return currentPage * 10 < totalItems ? nextPage : undefined
			},
			staleTime: 300000
		})

	const projectTracks = useMemo(() => {
		return data?.pages.flatMap((page) => page?.tracks ?? []) || []
	}, [data])

	const { ref: loadMoreRef, inView } = useInView()

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage()
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

	const toggleTrackSelection = (track: fetchTrack) => {
		if (!singleSelect) {
			setSelectedTrackIds((prev) =>
				prev.some((t) => t._id === track._id)
					? prev.filter((t) => t._id !== track._id)
					: [...prev, track]
			)
		} else {
			setSelectedTrackIds([track])
		}
	}

	const handleSubmit = () => {
		onClose()
		onSubmit?.(selectedTrackIds)
	}

	useEffect(() => {
		if (Array.isArray(initialData)) setSelectedTrackIds(initialData)
	}, [initialData])

	return (
		<div className="p-6 flex flex-col gap-4">
			<CustomInput
				type="text"
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				startContent={<SearchIcon className="text-gray-500" size={16} />}
				label="Choose your track"
				labelClassName="text-sm font-bold tracking-tighter text-[#33383F] leading-[21px]"
				classname="!border-hoverGray !rounded-lg"
			/>
			<div className="max-h-[339px] overflow-y-auto flex flex-col gap-4 scrollbar">
				{isPending ? (
					<Spinner color="default" size="lg" />
				) : (
					projectTracks.map((track: fetchTrack, index: number) => {
						const formattedDate = formatDate(track.createdAt || "")
						const showDate =
							index === 0 ||
							formatDate(projectTracks[index - 1]?.createdAt) !== formattedDate
						return (
							<div key={track._id}>
								{showDate && (
									<div className="text-sm text-gray-500 mb-4">
										{formattedDate}
									</div>
								)}
								<TrackCard
									track={track}
									trackurl={track.url || ""}
									mediaSrc={track.imageWaveSmall || ""}
									imageSrc={
										(track.artwork || TRACK_THUMBNAIL) as
											| string
											| StaticImageData
									}
									title={track.name || ""}
									extension={track.extension || ""}
									artist={track.user?.name || ""}
									duration={track.duration || 0}
									isSelected={selectedTrackIds.some((t) => t._id === track._id)}
									onSelect={() => toggleTrackSelection(track)}
									select
									showWaveform={true}
									isAIGenerated={track?.isAIGenerated}
								/>
							</div>
						)
					})
				)}
				<div ref={loadMoreRef}>
					{isFetchingNextPage && (
						<div className="flex items-center justify-center h-[50px] w-full">
							<Spinner />
						</div>
					)}
				</div>
			</div>
			<div className="flex justify-center self-end">
				<Savebtn
					label="Select File"
					onClick={handleSubmit}
					disabled={!selectedTrackIds.length}
					className="bg-btnColor text-white px-4 py-2 rounded-lg text-[13px] hover:bg-btnColorHover leading-[24px] font-bold tracking-[-0.01em]"
				/>
			</div>
		</div>
	)
}

export default TrackSelectionContent
