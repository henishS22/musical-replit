"use client"

import React, { useEffect, useMemo } from "react"
import { useInView } from "react-intersection-observer"

import { fetchExchangeNfts } from "@/app/api/query"
import { LoadingSkeleton } from "@/components/marketplace/LoadingSkeleton"
import NFTCard from "@/components/profile/tokenTab/NftCard"
import { generateQueryParams } from "@/helpers"
import { useInfiniteQuery } from "@tanstack/react-query"

const ExchangeNFTs = () => {
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
		useInfiniteQuery({
			queryKey: ["exchangeNftList"],
			queryFn: ({ pageParam }) => {
				return fetchExchangeNfts(
					generateQueryParams({
						page: pageParam,
						limit: "10"
					})
				)
			},
			initialPageParam: 1,
			getNextPageParam: (lastPage, allPages = []) => {
				const totalItems = lastPage?.pagination?.total || 0
				const currentPage = allPages.length
				const nextPage = currentPage + 1
				return currentPage * 10 < totalItems ? nextPage : undefined
			},

			staleTime: 300000
		})

	const nftData = useMemo(() => {
		return data?.pages.flatMap((page) => page?.nfts ?? []) || []
	}, [data])

	const { ref: loadMoreRef, inView } = useInView()

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage()
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

	if (isPending) {
		return (
			<div className="flex flex-wrap gap-[22px] w-full ">
				{[...Array(4)].map((_, index) => (
					<LoadingSkeleton key={`skeleton-${index}`} />
				))}
			</div>
		)
	}

	return (
		<>
			{nftData && nftData?.length > 0 ? (
				<div className="flex flex-wrap gap-[22px] w-full ">
					{nftData.map((nft) => (
						<NFTCard
							key={nft?._id}
							artworkUrl={nft?.user1_nft_details[0]?.artworkUrl}
							title={nft?.user1_nft_details[0]?.title}
							artist={nft?.user1_nft_details[0]?.user?.name}
							id={nft?.nft}
							redirectPath={`/exchange-nft/${nft?._id}`}
						/>
					))}
					{isFetchingNextPage &&
						[...Array(4)].map(
							(
								_,
								index // Render a few skeletons when fetching next page
							) => <LoadingSkeleton key={`skeleton-${index}`} />
						)}

					{/* Ref div used to trigger infinite loading */}
					{hasNextPage && <div ref={loadMoreRef} className="h-1" />}
				</div>
			) : (
				<div className="w-full h-40 flex items-center justify-center">
					<p className="text-lg text-gray-500">
						No NFT&apos;s available in marketplace for exchange
					</p>
				</div>
			)}
		</>
	)
}

export default ExchangeNFTs
