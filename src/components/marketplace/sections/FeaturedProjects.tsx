"use client"

import React from "react"
import { useInView } from "react-intersection-observer"

import { fetchPublicProjects } from "@/app/api/query"
import { LoadingSkeleton } from "@/components/marketplace/LoadingSkeleton"
import NFTCard from "@/components/profile/tokenTab/NftCard"
import { useInfiniteQuery } from "@tanstack/react-query"

const FeaturedProjects = () => {
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
		useInfiniteQuery({
			queryKey: ["featuredProjects"],
			queryFn: async () => {
				const url = ""
				return fetchPublicProjects(url)
			},
			initialPageParam: 0,
			getNextPageParam: (lastPage) => {
				const totalItems = lastPage?.pagination?.total || 0
				const currentPage = lastPage?.pagination?.offset || 0
				const nextPage = currentPage + 1
				return currentPage * 12 < totalItems ? nextPage : undefined
			},
			staleTime: 300000
		})

	const nftData = React.useMemo(() => {
		return data?.pages.flatMap((page) => page ?? []) || []
	}, [data])

	const { ref: loadMoreRef, inView } = useInView()

	React.useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage()
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

	if (isPending) {
		return (
			<div className="grid grid-cols-[repeat(auto-fit,minmax(244px,1fr))] gap-[22px] w-full ">
				{[...Array(4)].map((_, index) => (
					<LoadingSkeleton key={`skeleton-${index}`} />
				))}
			</div>
		)
	}

	return (
		<>
			<div className="grid grid-cols-[repeat(auto-fit,minmax(244px,1fr))] gap-[22px] w-full ">
				{nftData.map((nft) => (
					<NFTCard
						key={nft._id}
						artworkUrl={nft.artworkUrl}
						title={nft.title}
						artist={nft.user?.name}
						id={nft._id}
						redirectPath={`/project/${nft._id}`}
					/>
				))}
				{isFetchingNextPage &&
					[...Array(4)].map(
						(
							_,
							index // Render a few skeletons when fetching next page
						) => <LoadingSkeleton key={`skeleton-${index}`} />
					)}

				{/* Ref div used to trigger infinite loading, spans full column width */}
				{hasNextPage && <div ref={loadMoreRef} className="col-span-full h-1" />}
			</div>
		</>
	)
}

export default FeaturedProjects
