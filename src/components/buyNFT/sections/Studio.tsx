"use client"

import { useEffect, useMemo } from "react"
import { useInView } from "react-intersection-observer"
import Image from "next/image"

import { fetchNftDetails, fetchProject } from "@/app/api/query"
import { PROFILE_IMAGE } from "@/assets"
import AudioPlayer from "@/components/trackPlayer"
import { generateQueryParams } from "@/helpers"
import type { IApiResponseData } from "@/types/apiResponse"
import { Skeleton, Spinner } from "@nextui-org/react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"

import LockedCard from "./LockedCard"

export default function Studio({
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
			queryKey: ["studioTracks", projectId, nftId, signature, message],
			queryFn: ({ pageParam = 1 }) => {
				const url = generateQueryParams({
					tracksFor: "studio",
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

	const studioTracks = useMemo(() => {
		return data?.pages.flatMap((page) => page?.tracks ?? []) || []
	}, [data])

	const { ref: loadMoreRef, inView } = useInView()

	const { data: projectDetials } = useQuery({
		queryKey: ["project", projectId],
		queryFn: () => fetchProject(projectId),
		enabled: !!projectId,
		staleTime: 300000
	})

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
		<div className="px-[20px] py-3 flex gap-4">
			{/* Track List */}
			<div className="flex flex-[2] flex-col gap-4">
				{studioTracks.map((track: IApiResponseData) => (
					<div key={track?._id} className="w-full flex flex-col gap-2">
						{signature ? (
							<AudioPlayer
								isComment={false}
								track={track}
								title={track?.name}
								artist={track?.user?.name}
								audioUrl={track?.url}
								coverImage={track?.artwork}
								extension={track?.extension}
								trackId={track?._id}
								trackComment={track?.trackComments}
							/>
						) : (
							<LockedCard label={track?.name} />
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

			<div className="flex-1 max-w-[288px]">
				{/* Collaborators Section */}
				<div className="border border-[#F4F4F4] rounded-xl p-4 flex flex-col gap-3">
					<h3 className="text-base font-semibold">Collaborators</h3>
					<div className="flex gap-2 flex-wrap">
						{projectDetials && projectDetials?.collaborators?.length > 0 ? (
							projectDetials?.collaborators?.map((item, index) => (
								<div
									key={index}
									className="flex items-center gap-2 rounded-full"
								>
									{/* <div className="w-6 h-6 rounded-full bg-gray-300" /> */}
									<Image
										src={(item?.user?.profile_img as string) || PROFILE_IMAGE}
										className="w-6 h-6 rounded-full"
										alt="profile"
										width={24}
										height={24}
									/>
									<span className="text-sm">{item?.user?.name}</span>
								</div>
							))
						) : (
							<span className="text-sm">No collaborators</span>
						)}
					</div>
				</div>

				{/* Instruments Section */}
				<div className="mt-8 p-4">
					<h3 className="text-base font-semibold mb-3">Instruments</h3>
					<div className="flex flex-wrap gap-2">
						{data?.pages?.[0]?.instrument &&
						data?.pages?.[0]?.instrument?.length > 0 ? (
							data?.pages?.[0]?.instrument?.map((item) => (
								<div
									key={item?._id}
									className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-full"
								>
									<div
										className={`flex gap-2.5 justify-center items-center self-stretch my-auto w-6 h-6  rounded-sm min-h-[24px]`}
									>
										<Image
											src={`${process.env.NEXT_PUBLIC_INSTRUMENT_ICON_BASE_URL || "https://backend.guildtogether.com"}/${item?.icon}`}
											alt={item?.instrument}
											width={24}
											height={24}
										/>
									</div>
									<div className="self-stretch my-auto p-1">
										{item?.instrument}
									</div>
								</div>
							))
						) : (
							<span className="text-sm">No instruments</span>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
