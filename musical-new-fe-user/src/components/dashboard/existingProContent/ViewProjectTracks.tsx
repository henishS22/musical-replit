import { useEffect, useMemo, useState } from "react"
import { useInView } from "react-intersection-observer"
import { StaticImageData } from "next/image"

import { fetchProjectTracks } from "@/app/api/query"
import { TRACK_THUMBNAIL } from "@/assets"
import TrackCard from "@/components/createOpportunity/TrackCard"
import { generateQueryParams } from "@/helpers"
import { IApiResponseData } from "@/types/apiResponse"
import { Button, Skeleton, Spinner } from "@nextui-org/react"
import { useInfiniteQuery } from "@tanstack/react-query"

import { useDynamicStore } from "@/stores"

const ViewProjectTracks = ({
	id,
	selectionMode = "multiple",
	onClose
}: {
	id: string
	selectionMode?: "single" | "multiple"
	onClose?: () => void
}) => {
	const [selectedTrackIds, setSelectedTrackIds] = useState<IApiResponseData[]>(
		[]
	)
	const { addState } = useDynamicStore()
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
		useInfiniteQuery({
			queryKey: ["projectTracks", id],
			initialPageParam: 1,
			queryFn: (pageParam) => {
				return fetchProjectTracks(
					id as string,
					generateQueryParams({
						page: pageParam.toString(),
						limit: "10"
					})
				)
			},
			getNextPageParam: (lastPage, allPages) => {
				const totalItems = lastPage?.pagination?.totalCount || 0
				const currentPage = allPages?.length
				return currentPage * 10 < totalItems ? currentPage + 1 : undefined // Assuming 10 items per page
			},
			staleTime: 300000
		})

	const projectTracks = useMemo(() => {
		return data?.pages.flatMap((page) => page?.tracks ?? []) || [] // Flattening all pages
	}, [data])

	const { ref: loadMoreRef, inView } = useInView()

	const toggleTrackSelection = (track: IApiResponseData) => {
		let updatedTrackIds: IApiResponseData[]

		if (selectionMode === "single") {
			// For single selection, replace the entire selection with the new track
			updatedTrackIds = [track]
		} else {
			// For multiple selection, toggle the track selection
			updatedTrackIds = selectedTrackIds.some((t) => t._id === track._id)
				? selectedTrackIds.filter((t) => t._id !== track._id)
				: [...selectedTrackIds, track]
		}

		setSelectedTrackIds(updatedTrackIds)
		addState("tokenTracks", updatedTrackIds)
		addState("trackId", updatedTrackIds[0])
	}

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage() // Fetch next page when the element is in view
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

	// Add cleanup effect when component unmounts
	useEffect(() => {
		return () => {
			// Stop all audio elements when component unmounts
			const audioElements = document.getElementsByTagName("audio")
			Array.from(audioElements).forEach((audio) => {
				audio.pause()
				audio.currentTime = 0
			})
		}
	}, [])

	return (
		<div className="w-full flex flex-col gap-4">
			{projectTracks && projectTracks?.length > 0 ? (
				projectTracks?.map((track: IApiResponseData) => (
					<div key={track._id} className="w-full flex flex-col gap-2">
						<TrackCard
							track={track}
							trackurl={track?.url || ""}
							mediaSrc={track?.imageWaveSmall || ""}
							imageSrc={
								(track?.artwork || TRACK_THUMBNAIL) as string | StaticImageData
							}
							title={track?.name || ""}
							extension={track?.extension || ""}
							artist={track?.user?.name || ""}
							duration={track?.duration || 0}
							isSelected={selectedTrackIds.some((t) => t._id === track._id)}
							onSelect={() => toggleTrackSelection(track)}
							select
							showWaveform={true}
							isMuted={true}
							isAIGenerated={track?.isAIGenerated}
						/>
					</div>
				))
			) : isPending ? (
				<div className="w-full space-y-4">
					{Array.from({ length: 3 }).map((_, index) => (
						<Skeleton key={index} className="w-full h-[139px] rounded-lg" />
					))}
				</div>
			) : (
				<div className="w-full flex flex-col items-center justify-center">
					<div className="font-medium text-[14px] leading-[24px] tracking-[-0.01em] text-center min-h-[100px] flex items-center ">
						No tracks in the project yet
					</div>
				</div>
			)}
			<div ref={loadMoreRef}>
				{isFetchingNextPage && (
					<div className="flex items-center justify-center h-[50px] w-full">
						<Spinner />
					</div>
				)}
			</div>
			{selectionMode === "single" && (
				<div className="sticky bottom-0 w-full py-4 bg-background z-10">
					<Button
						color="primary"
						className="w-full bg-btnColor text-white px-5 py-3 rounded-lg text-[15px] hover:bg-btnColorHover leading-[24px] font-bold tracking-[-0.01em]"
						onPress={onClose}
						isDisabled={!selectedTrackIds.length}
					>
						Select Track
					</Button>
				</div>
			)}
		</div>
	)
}

export default ViewProjectTracks
