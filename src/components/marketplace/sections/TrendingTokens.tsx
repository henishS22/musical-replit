"use client"

import React from "react"
import { useInView } from "react-intersection-observer"

import { fetchNfts } from "@/app/api/query"
import { LoadingSkeleton } from "@/components/marketplace/LoadingSkeleton"
import NFTCard from "@/components/profile/tokenTab/NftCard"
import { generateQueryParams } from "@/helpers"
import { INft } from "@/types/apiResponse"
import { useInfiniteQuery } from "@tanstack/react-query"

export interface PaginatedResponse<T> {
	data: T
	pagination: {
		total: number
		page: number
		limit: number
		pages: number
	}
}

const TrendingTokens = () => {
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
		useInfiniteQuery({
			queryKey: ["trendingTokens"],
			queryFn: async ({ pageParam = 1 }) => {
				const url = generateQueryParams({
					offset: 0,
					page: pageParam.toString(),
					limit: "10",
					includeUsdPrices: true
				})
				const response = await fetchNfts(url)
				return response
			},
			initialPageParam: 1,
			getNextPageParam: (lastPage) => {
				const totalItems =
					(lastPage as unknown as PaginatedResponse<INft[]>).pagination
						?.total || 0
				const currentPage =
					(lastPage as unknown as PaginatedResponse<INft[]>).pagination?.page ||
					1
				const nextPage = currentPage + 1
				return currentPage * 10 < totalItems ? nextPage : undefined
			},
			staleTime: 300000
		})

	const nftData = React.useMemo(() => {
		return data?.pages.flatMap((page) => page?.data ?? []) || []
	}, [data])

	const { ref: loadMoreRef, inView } = useInView()

	React.useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage()
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

	if (isPending) {
		return (
			<>
				{[...Array(4)].map((_, index) => (
					<div key={`skeleton-${index}`} className="flex flex-wrap gap-4">
						<LoadingSkeleton />
					</div>
				))}
			</>
		)
	}

	return (
		<>
			{nftData.length > 0 ? (
				<div className="grid grid-cols-[repeat(auto-fit,minmax(244px,1fr))] gap-[22px] w-full ">
					{nftData.map((nft) => (
						<NFTCard
							key={nft._id}
							artworkUrl={nft.artworkUrl}
							title={nft.title}
							artist={nft.user?.name}
							id={nft._id}
							redirectPath={`/buy-nft/${nft._id}`}
						/>
					))}
					{isFetchingNextPage &&
						[...Array(4)].map((_, index) => (
							<LoadingSkeleton key={`skeleton-${index}`} />
						))}

					{/* Ref div used to trigger infinite loading */}
					{hasNextPage && (
						<div ref={loadMoreRef} className="col-span-full h-1" />
					)}
				</div>
			) : (
				<div className="w-full h-40 flex items-center justify-center">
					<p className="text-lg text-gray-500">
						No tokens available in marketplace
					</p>
				</div>
			)}
		</>
	)
}

export default TrendingTokens
