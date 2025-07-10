"use client"

import { useEffect, useMemo } from "react"
import { useInView } from "react-intersection-observer"

import { fetchNftDetails } from "@/app/api/query"
import AudioPlayer from "@/components/trackPlayer"
import { generateQueryParams } from "@/helpers"
import type { IApiResponseData } from "@/types/apiResponse"
import { Skeleton, Spinner } from "@nextui-org/react"
import { useInfiniteQuery } from "@tanstack/react-query"

import LockedCard from "./LockedCard"

export default function Collectibles({
	projectId,
	nftId,
	signature,
	message
}: {
	projectId: string
	nftId: string
	signature: string
	message: string
}) {
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
		useInfiniteQuery({
			queryKey: ["collectibles", projectId, nftId],
			queryFn: ({ pageParam = 1 }) => {
				const url = generateQueryParams({
					tracksFor: "collectibles",
					page: pageParam.toString(),
					limit: "10",
					signature: signature ?? "",
					message: message ?? ""
				})
				return fetchNftDetails(nftId, projectId, url)
			},
			initialPageParam: 1,
			getNextPageParam: (lastPage, allPages) => {
				const totalItems = lastPage?.pagination?.totalCount || 0
				const currentPage = allPages.length
				const nextPage = currentPage + 1
				return currentPage * 10 < totalItems ? nextPage : undefined
			},
			enabled: !!projectId && !!nftId
		})

	const collectibleTracks = useMemo(() => {
		return data?.pages.flatMap((page) => page?.tracks ?? []) || []
	}, [data])

	const { ref: loadMoreRef, inView } = useInView()

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage()
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

	if (isPending) {
		return (
			<div className="p-4">
				<div className="grid grid-cols-1 md:grid-cols-1 gap-6">
					{Array.from({ length: 3 }).map((_, index) => (
						<Skeleton key={index} className="w-full h-[80px] rounded-lg" />
					))}
				</div>
			</div>
		)
	}

	return (
		<div className="p-4">
			<div className="grid grid-cols-1 md:grid-cols-1 gap-6">
				{collectibleTracks.map((track: IApiResponseData) => (
					<div key={track._id}>
						{signature ? (
							<AudioPlayer
								isComment={false}
								track={track}
								title={track.name}
								artist={track.user.name}
								audioUrl={track.url}
								coverImage={track.artwork}
								extension={track.extension}
								trackId={track._id}
								trackComment={track.trackComments}
							/>
						) : (
							<LockedCard label={track.name} />
						)}
					</div>
				))}
				<div ref={loadMoreRef}>
					{isFetchingNextPage && (
						<div className="flex items-center justify-center h-[50px] w-full">
							<Spinner />
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
