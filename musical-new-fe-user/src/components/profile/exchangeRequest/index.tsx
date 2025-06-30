"use client"

import { useEffect, useMemo } from "react"
import { useInView } from "react-intersection-observer"

import { fetchRequestedExchangeNfts } from "@/app/api/query"
import { generateQueryParams } from "@/helpers"
import { Spinner } from "@nextui-org/react"
import { useInfiniteQuery } from "@tanstack/react-query"

import ExchangeNFTSection from "../tokenTab/ExchangeNFTSection"

const ExchangeRequest: React.FC = () => {
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
		useInfiniteQuery({
			queryKey: ["requestedExchangeNfts"],
			queryFn: ({ pageParam = 1 }) => {
				return fetchRequestedExchangeNfts(
					generateQueryParams({
						page: pageParam.toString(),
						limit: "10"
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
			staleTime: 1000 * 60 * 60 * 24
		})

	const { ref: loadMoreRef, inView } = useInView()

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage()
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

	const nfts = useMemo(() => {
		return data?.pages.flatMap((page) => page?.nfts ?? []) || []
	}, [data])

	return (
		<div className="flex flex-col gap-10 mt-6">
			<div className="flex flex-col gap-6 h-[calc(100vh-200px)] overflow-y-auto scrollbar">
				<ExchangeNFTSection
					heading="Exchange Tokens"
					showViewAll={false}
					classNames={{
						heading:
							"!font-semibold !text-[20px] !leading-[32px] !tracking-[-0.02em] text-textPrimary"
					}}
					nftData={nfts}
					loading={isPending}
					basePath={`/exchange-nft`}
				/>
				{isFetchingNextPage && (
					<div className="flex items-center justify-center h-[50px] w-full">
						<Spinner />
					</div>
				)}
				<div ref={loadMoreRef} className="h-1" />
			</div>
		</div>
	)
}

export default ExchangeRequest
