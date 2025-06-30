"use client"

// import Image from "next/image"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { fetchRecentTrack } from "@/app/api/query"
import { TRACK_THUMBNAIL } from "@/assets"
import { generateQueryParams, getMediaType, showText } from "@/helpers"
import { RecentFileType } from "@/types/dashboarApiTypes"
import { Button } from "@nextui-org/react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"

import { useDynamicStore } from "@/stores"

export function RecentFiles({
	selectedValue
}: {
	selectedValue: { startDate?: Date; endDate?: Date } | undefined
}) {
	const router = useRouter()
	const { removeState, addState } = useDynamicStore()
	//#region Fetch Recent Tracks
	const { isPending, data } = useQuery({
		queryKey: [
			"recent-tracks",
			selectedValue?.startDate,
			selectedValue?.endDate
		],
		queryFn: () => {
			// const baseQuery = "limit=10"
			const startDateQuery =
				selectedValue && selectedValue.startDate && selectedValue.endDate
					? `&startDate=${format(selectedValue.startDate, "yyyy-MM-dd")}&endDate=${format(selectedValue.endDate, "yyyy-MM-dd")}`
					: ""
			return fetchRecentTrack(
				generateQueryParams({
					limit: "10",
					startDateQuery
				})
			)
		},
		staleTime: 20000
	})

	return (
		<section className="space-y-6">
			<div className="flex flex-wrap gap-5">
				{isPending ? (
					<>
						{/* Skeleton Loading */}
						{Array.from({ length: 6 }).map((_, index) => (
							<div
								key={index}
								className="animate-pulse overflow-hidden w-[118px]"
							>
								<div className="bg-gray-300 rounded-xl w-[118px] h-[118px]"></div>
								<div className="py-4 space-y-2">
									<div className="bg-gray-300 h-4 w-3/4 rounded"></div>
									<div className="bg-gray-300 h-3 w-1/2 rounded"></div>
								</div>
							</div>
						))}
					</>
				) : (
					<>
						{/* Show Data */}
						{data?.tracks?.length > 0 ? (
							data?.tracks?.map((album: RecentFileType) => (
								<div
									key={album._id}
									className="overflow-hidden w-[118px]"
									onClick={() => {
										addState("mediaPlayer", {
											item: album,
											audioUrl: album?.url,
											coverUrl: album?.artwork || TRACK_THUMBNAIL,
											title: album?.name || "",
											artist: album?.user?.name || "",
											duration: album?.duration || 0,
											extension: getMediaType(`sample.${album?.extension}`),
											videoUrl: album?.url
										})
									}}
								>
									<div className="relative w-[118px] h-[118px] cursor-pointer">
										<Image
											src={album?.artwork || TRACK_THUMBNAIL}
											alt={`${album?.name} album cover`}
											width={118}
											height={118}
											className="object-cover rounded-xl min-h-[118px]"
										/>
										{album?.isAIGenerated && (
											<div className="absolute top-1 left-1 bg-black  bg-gradient-to-br from-gray-700 via-green-700 to-blue-700 text-white text-xs px-2 py-1 rounded-full">
												AI
											</div>
										)}
									</div>
									<div className="py-4">
										<h3 className="font-medium text-sm text-[#0D5326]">
											{showText(album?.name)}
										</h3>
										<p className="text-sm text-[#949494] truncate">
											{format(album?.createdAt, "MM/yy")} •{" "}
											{album?.album ? showText(album?.album) : "Single"}
										</p>
									</div>
								</div>
							))
						) : (
							<div className="flex flex-col gap-2 justify-center items-center w-full">
								<span className="text-sm font-medium text-gray-500 leading-normal">
									There are no Tracks to show
								</span>
								<Button
									variant="flat"
									color="default"
									onPress={() => {
										removeState("linkTrack")
										removeState("isReleaseTrack")
										removeState("trackFiles")
										router.push("/upload-new-work")
									}}
									className="h-10 px-2 text-sm text-black font-semibold bg-[#FCFCFC] border-2 border-customGray hover:bg-gray-100 rounded-lg  py-2.5 me-2 mb-2 "
								>
									Create New Track
								</Button>
							</div>
						)}
					</>
				)}
			</div>
		</section>
	)
}
