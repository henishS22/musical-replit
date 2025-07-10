"use client"

import React from "react"
import { useInView } from "react-intersection-observer"

import { fetchMarketQuest } from "@/app/api/query"
import { PROFILE_IMAGE } from "@/assets"
import { SocialIcons } from "@/components/missions/socialIcons"
import { MISSIONS_MODAL } from "@/constant/modalType"
import { generateQueryParams } from "@/helpers"
import { useInfiniteQuery } from "@tanstack/react-query"
import moment from "moment"

import { useModalStore } from "@/stores"

import MarketQuestCard from "./MarketQuestCard"
import MarketQuestCardSkeleton from "./MarketQuestCardSkeleton"
import MissionHeader from "./MissionHeader"

interface LatestMissionsProps {
	showAll: boolean
	onViewAll?: () => void
}

const LatestMissions: React.FC<LatestMissionsProps> = ({
	showAll,
	onViewAll
}) => {
	const { showCustomModal } = useModalStore()
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
		useInfiniteQuery({
			queryKey: ["marketQuest"],
			queryFn: async ({ pageParam = 1 }) => {
				const url = generateQueryParams({
					page: pageParam.toString(),
					limit: "10"
				})
				const response = await fetchMarketQuest(url)
				return response
			},
			initialPageParam: 1,
			getNextPageParam: (lastPage, allPages) => {
				const totalItems = lastPage?.total || 0
				const currentPage = allPages.length
				const nextPage = currentPage + 1
				return currentPage * 10 < totalItems ? nextPage : undefined
			},
			staleTime: 300000
		})

	const questData = React.useMemo(() => {
		return data?.pages.flatMap((page) => page ?? []) || []
	}, [data])

	const { ref: loadMoreRef, inView } = useInView()

	const handleOpenModal = (
		title: string,
		identifier: string,
		description: string,
		_id: string
	) => {
		showCustomModal({
			customModalType: MISSIONS_MODAL,
			tempCustomModalData: {
				title: title,
				identifier: identifier,
				description: description,
				creatorQuestId: _id
			}
		})
	}

	React.useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage()
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

	if (isPending) {
		return <MarketQuestCardSkeleton showAll={showAll} />
	}

	return (
		<section>
			<MissionHeader showAll={showAll} onViewAll={onViewAll} />
			<div
				className={`flex flex-wrap gap-6 items-start mt-4 w-full max-md:max-w-full ${showAll ? "flex-col" : "flex-row"}`}
			>
				{questData[0]?.data?.length > 0 ? (
					(showAll ? questData[0].data : questData[0].data.slice(0, 3)).map(
						(mission: {
							quest: { name: string; _id: string }
							user: { name: string; profile_img: string; _id: string }
							description: string
							_id: string
							createdAt: string
							identifier: string
						}) => (
							<MarketQuestCard
								onClick={() =>
									handleOpenModal(
										mission?.quest?.name,
										mission?.identifier,
										mission?.description,
										mission?._id
									)
								}
								key={mission?._id}
								title={mission?.quest?.name}
								description={mission?.description}
								userAvatarUrl={mission?.user?.profile_img || PROFILE_IMAGE}
								userName={mission?.user?.name}
								userId={mission?.user?._id}
								date={moment(mission?.createdAt).format("DD MMM YY | HH:mm")}
								iconUrl={SocialIcons[mission?.identifier]}
							/>
						)
					)
				) : (
					<div className="w-full h-40 flex items-center justify-center">
						<p className="text-lg text-gray-500">No quest available</p>
					</div>
				)}
				{hasNextPage && (
					<div
						ref={loadMoreRef}
						className="w-full h-20 flex items-center justify-center"
					>
						{isFetchingNextPage && "Loading..."}
					</div>
				)}
			</div>
		</section>
	)
}

export default LatestMissions
