"use client"

import React from "react"
import { useInView } from "react-intersection-observer"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { fetchArtists } from "@/app/api/query"
import { PROFILE_IMAGE } from "@/assets"
import { generateQueryParams } from "@/helpers"
import { Button, Skeleton } from "@nextui-org/react"
import { useInfiniteQuery } from "@tanstack/react-query"

import { NoDataFound } from "../ui"

const CreatorSkeleton = () => (
	<div className="flex items-center gap-3">
		<Skeleton className="rounded-full w-[60px] h-[60px]" />
		<Skeleton className="h-4 w-24 rounded-lg" />
	</div>
)

interface LatestCreatorsProps {
	onViewAll?: (section: string) => void
	showAll?: boolean
}

const LatestCreators: React.FC<LatestCreatorsProps> = ({
	onViewAll,
	showAll = false
}) => {
	const router = useRouter()
	const { ref: loadMoreRef, inView } = useInView()

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useInfiniteQuery({
			queryKey: ["latest-creators"],
			queryFn: async ({ pageParam = 1 }) => {
				const url = generateQueryParams({
					page: pageParam,
					limit: 8
				})
				return fetchArtists(url)
			},
			initialPageParam: 1,
			getNextPageParam: (lastPage) => {
				const totalItems = lastPage?.pagination?.total || 0
				const currentPage = lastPage?.pagination?.page || 1
				const nextPage = currentPage + 1
				return currentPage * 8 < totalItems ? nextPage : undefined
			},
			staleTime: 1000 * 60 * 60 * 24
		})

	// Only flatten all pages if showAll, otherwise just take first 8 from first page
	const creators = React.useMemo(() => {
		if (showAll) {
			return data?.pages.flatMap((page) => page?.data ?? []) || []
		}
		return data?.pages?.[0]?.data?.slice(0, 8) || []
	}, [data, showAll])

	React.useEffect(() => {
		if (showAll && inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage()
		}
	}, [showAll, inView, hasNextPage, isFetchingNextPage, fetchNextPage])

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<h2 className="font-semibold text-[20px] leading-[32px] tracking-[-0.02em] text-textPrimary">
					Latest Creators
				</h2>
				{onViewAll && (
					<Button
						onPress={() => onViewAll("Latest Creators")}
						type="submit"
						className="px-5 py-3 gap-2 rounded-lg bg-btnColor text-white font-bold text-[15px]"
					>
						View All
					</Button>
				)}
			</div>
			<div className="grid grid-cols-4 gap-6 w-full">
				{creators.length > 0 ? (
					creators.map(
						(creator: { _id: string; profile_img: string; name: string }) => (
							<div
								key={creator._id}
								className="flex items-center gap-3 cursor-pointer"
								onClick={() => router.push(`/profile/${creator._id}`)}
							>
								<Image
									src={creator.profile_img || PROFILE_IMAGE}
									alt={creator.name}
									width={60}
									height={60}
									className="rounded-full border border-metallicGray h-[60px] w-[60px] object-cover"
								/>
								<span className="font-semibold text-[14px] leading-[19.12px] tracking-[-0.02em] text-black">
									{creator.name}
								</span>
							</div>
						)
					)
				) : (
					<div className="w-full col-span-4">
						<NoDataFound message="No creators found" />
					</div>
				)}
			</div>
			{showAll && hasNextPage && (
				<div ref={loadMoreRef} className="grid grid-cols-4 gap-6 w-full">
					{isFetchingNextPage && (
						<>
							<CreatorSkeleton />
							<CreatorSkeleton />
							<CreatorSkeleton />
							<CreatorSkeleton />
						</>
					)}
				</div>
			)}
		</div>
	)
}

export default LatestCreators
