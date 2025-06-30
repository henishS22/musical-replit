"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useInView } from "react-intersection-observer"

import { fetchExternalQuestHistory } from "@/app/api/query"
import { SocialIcons } from "@/components/missions/socialIcons"
import { CustomInput, NoDataFound } from "@/components/ui"
import { generateQueryParams } from "@/helpers"
import { useInfiniteQuery } from "@tanstack/react-query"
import { SearchIcon } from "lucide-react"

import { ExternalCard } from "./ExternalCard"
import ExternalCardSkeleton from "./ExternalCardSkeleton"

interface inProgressProp {
	isPublished: boolean
}

export const External: React.FC<inProgressProp> = ({ isPublished }) => {
	const { ref: loadMoreRef, inView } = useInView()
	const [txtFilter, setTxtFilter] = useState<string>()

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
		useInfiniteQuery({
			queryKey: ["external", isPublished, txtFilter],
			queryFn: ({ pageParam = 1 }) => {
				const url = generateQueryParams({
					page: pageParam.toString(),
					limit: "10",
					search: txtFilter as string
				})
				return fetchExternalQuestHistory(url)
			},
			initialPageParam: 1,
			getNextPageParam: (lastPage, allPages) => {
				const totalItems = lastPage?.pagination?.total || 0
				const currentPage = allPages.length
				const nextPage = currentPage + 1
				return currentPage * 10 < totalItems ? nextPage : undefined
			}
		})

	const questData = useMemo(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return data?.pages[0]?.data.flatMap((page: any) => page ?? []) || []
	}, [data])

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage()
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

	if (isPending) {
		return <ExternalCardSkeleton />
	}

	return (
		<section className="flex flex-col gap-6 mt-6">
			{questData.length > 0 && (
				<CustomInput
					value={txtFilter}
					onChange={(e) => setTxtFilter(e.target.value)}
					type="text"
					placeholder="Search artist"
					classname={`border-2 !border-hoverGray !shadow-none max-w-[200px] self-center`}
					rounded="rounded-lg"
					mainWrapperClassName="flex justify-end items-end"
					labelClassName="font-bold text-[14px] leading-[21px] tracking-[-1.5%] text-inputLabel"
					startContent={
						<SearchIcon className="text-gray-500" height={16} width={16} />
					}
				/>
			)}
			{questData.length > 0 ? (
				<>
					{questData.map(
						(item: {
							createdAt: string
							points: number
							_id: string
							questId: { name: string; identifier: string }
							creatorQuestId: {
								userId: {
									name: string
									profile_img: string
								}
							}
						}) => (
							<ExternalCard
								key={item?._id}
								icon={
									SocialIcons[
										item?.questId?.identifier as keyof typeof SocialIcons
									]
								}
								title={item?.questId?.name}
								points={item?.points}
								createdAt={item?.createdAt}
								user_img={
									item.creatorQuestId &&
									item.creatorQuestId?.userId?.profile_img
								}
								user_name={
									item.creatorQuestId && item.creatorQuestId?.userId?.name
								}
							/>
						)
					)}
					<div ref={loadMoreRef}>
						{isFetchingNextPage && <ExternalCardSkeleton />}
					</div>
				</>
			) : (
				<NoDataFound />
			)}
		</section>
	)
}

export default External
