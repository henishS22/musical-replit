"use client"

import * as React from "react"
import { useEffect } from "react"
import { useInView } from "react-intersection-observer"

import { fetchPlatformQuestHistory } from "@/app/api/query"
import { CreateQuest } from "@/components/modal/createQuest/CreateQuest"
import { NoDataFound } from "@/components/ui"
import { generateQueryParams } from "@/helpers"
import { useInfiniteQuery } from "@tanstack/react-query"

import { PlatformCard } from "./PlatformCard"
import PlatformSkeleton from "./PlatformSkeleton"

export default function Platform() {
	const { ref: loadMoreRef, inView } = useInView()

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
		useInfiniteQuery({
			queryKey: ["platform"],
			queryFn: ({ pageParam = 1 }) => {
				const url = generateQueryParams({
					page: pageParam.toString(),
					limit: "10"
				})
				return fetchPlatformQuestHistory(url)
			},
			initialPageParam: 1,
			getNextPageParam: (lastPage, allPages) => {
				const totalItems = lastPage?.pagination?.total || 0
				const currentPage = allPages.length
				const nextPage = currentPage + 1
				return currentPage * 10 < totalItems ? nextPage : undefined
			}
		})

	const platformQuests = React.useMemo(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return data?.pages[0]?.events.flatMap((page: any) => page ?? []) || []
	}, [data])

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage()
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

	if (isPending) {
		return <PlatformSkeleton />
	}

	return (
		<div className="flex flex-col gap-6 mt-6">
			{platformQuests.length > 0 ? (
				<>
					{platformQuests.map(
						(item: {
							createdAt: string
							points: number
							_id: string
							identifier: string
							eventDetails: { name: string }
							updatedAt: string
						}) => (
							<PlatformCard
								key={item?._id}
								title={item.eventDetails?.name}
								points={item.points}
								updatedAt={item?.updatedAt}
							/>
						)
					)}
					<div ref={loadMoreRef}>
						{isFetchingNextPage && (
							<div className="flex items-center justify-center h-[50px] w-full">
								<PlatformSkeleton />
							</div>
						)}
					</div>
				</>
			) : (
				<NoDataFound />
			)}
			<CreateQuest />
		</div>
	)
}
