"use client"

import React from "react"
import { useInView } from "react-intersection-observer"
import { useInfiniteQuery } from "@tanstack/react-query"

import { fetchGuildedNfts } from "@/app/api/query"
import { LoadingSkeleton } from "@/components/marketplace/LoadingSkeleton"
import NFTCard from "@/components/profile/tokenTab/NftCard"

interface GuildedNFTProps {
	showAll?: boolean
  onViewAll?: (section: string) => void
}

const GuildedNFT: React.FC<GuildedNFTProps> = ({ showAll = false, onViewAll }) => {
	const { ref, inView } = useInView()

	const {
		data,
		isLoading,
		isError,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage
	} = useInfiniteQuery({
		queryKey: ["guildedNfts"],
		queryFn: ({ pageParam = 1 }) => {
			const queryParams = `?page=${pageParam}&limit=${showAll ? 20 : 6}&isListed=true`
			return fetchGuildedNfts(queryParams)
		},
		getNextPageParam: (lastPage, allPages) => {
			if (!lastPage?.pagination) return undefined
			const { page, pages } = lastPage.pagination
			return page < pages ? page + 1 : undefined
		},
		initialPageParam: 1
	})

	React.useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage()
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isError) {
		return (
			<div className="flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<h2 className="font-semibold text-[20px] leading-[32px] tracking-[-0.02em] text-textPrimary">
						Guild Passes
					</h2>
					{onViewAll && (
						<button
							onClick={() => onViewAll("Guild Passes")}
							className="px-5 py-3 gap-2 rounded-lg bg-btnColor text-white font-bold text-[15px]"
						>
							View All
						</button>
					)}
				</div>
				<div className="w-full">
					<p className="text-gray-500">Failed to load Guild Passes</p>
				</div>
			</div>
		)
	}

	const allNfts = data?.pages?.flatMap((page) => page?.data || []) || []

	if (allNfts.length === 0) {
		return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[20px] leading-[32px] tracking-[-0.02em] text-textPrimary">
            Guild Passes
          </h2>
          {onViewAll && (
            <button
              onClick={() => onViewAll("Guild Passes")}
              className="px-5 py-3 gap-2 rounded-lg bg-btnColor text-white font-bold text-[15px]"
            >
              View All
            </button>
          )}
        </div>
				<div className="text-center py-8">
					<p className="text-gray-500">No Guild Passes available</p>
				</div>
      </div>
		)
	}

	return (
		<div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-[20px] leading-[32px] tracking-[-0.02em] text-textPrimary">
          Guild Passes
        </h2>
        {onViewAll && (
          <button
            onClick={() => onViewAll("Guild Passes")}
            className="px-5 py-3 gap-2 rounded-lg bg-btnColor text-white font-bold text-[15px]"
          >
            View All
          </button>
        )}
      </div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{isLoading ? (
          Array.from({ length: showAll ? 9 : 6 }).map((_, index) => (
					  <LoadingSkeleton key={index} />
				  ))
        ) : (
          allNfts.map((nft, index) => (
            <NFTCard
              key={`${nft._id}-${index}`}
              nft={nft}
              showPrice={true}
              onCardClick={() => {
                // Handle NFT card click
              }}
            />
          ))
        )}
			</div>

			{/* Loading indicator for infinite scroll */}
			{(hasNextPage || isFetchingNextPage) && (
				<div ref={ref} className="flex justify-center py-4">
					{isFetchingNextPage && <LoadingSkeleton />}
				</div>
			)}
		</div>
	)
}

export default GuildedNFT