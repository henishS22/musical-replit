"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { fetchPublicStream, fetchToBeHostedStream } from "@/app/api/query"
import { NFT_DETAIL_DEMO } from "@/assets"
import { useQuery } from "@tanstack/react-query"

import { useDynamicStore } from "@/stores"

import LiveStreamDetail from "../modal/livestreamDetail/LiveStreamDetail"
import Savebtn from "../ui/savebtn/savebtn"
import { LivestreamGrid } from "./LivestreamGrid"
import LiveStreamTabs from "./LiveStreamTabs"

const FeaturedLivestream = () => {
	const [activeTab, setActiveTab] = useState("My Streams")
	const isPublicStreams = activeTab === "Public Streams"
	const { addState } = useDynamicStore()
	const router = useRouter()

	const { data: publicStream, isLoading } = useQuery({
		queryKey: ["publicStream"],
		queryFn: () => fetchPublicStream()
	})

	const { data: toBeHostedStream, isLoading: toBeHostedStreamLoading } =
		useQuery({
			queryKey: ["toBeHostedStream"],
			queryFn: () => fetchToBeHostedStream(),
			enabled: !isPublicStreams
		})

	useEffect(() => {
		addState("isPublicStreams", isPublicStreams)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isPublicStreams])

	return (
		<main className="min-h-screen bg-background">
			<div className="bg-white flex flex-col items-stretch justify-center p-6 rounded-xl max-md:px-5">
				<section className="self-stretch bg-[#DDF5E5] w-full gap-2.5 text-xl text-[rgba(26,29,31,1)] font-bold py-7 rounded-xl max-md:max-w-full text-center">
					Start discovering Livestream and Enjoy
				</section>

				<section className="w-full mt-8 max-md:max-w-full">
					<div className="w-full max-md:max-w-full">
						<div className="flex justify-between items-center">
							<h2 className="self-stretch gap-4 my-auto text-xl font-bold tracking-normal leading-tight text-textPrimary">
								Featured Livestreams
							</h2>
							{!isPublicStreams && (
								<Savebtn
									className="px-5 py-3 gap-2 rounded-lg bg-videoBtnGreen text-[#0D5326] font-bold text-[15px]"
									label="Create a stream"
									onClick={() => router.push("/livestream")}
								/>
							)}
						</div>

						{/* Tabs for selecting stream type */}
						<LiveStreamTabs activeTab={activeTab} setActiveTab={setActiveTab} />

						{isLoading || toBeHostedStreamLoading ? (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
								{[1, 2, 3, 4, 5, 6].map((i) => (
									<div key={i} className="animate-pulse">
										<div className="bg-gray-200 h-48 rounded-lg"></div>
										<div className="mt-4 space-y-3">
											<div className="h-4 bg-gray-200 rounded w-3/4"></div>
											<div className="h-4 bg-gray-200 rounded w-1/2"></div>
										</div>
									</div>
								))}
							</div>
						) : (
							<LivestreamGrid
								streams={
									(isPublicStreams ? publicStream : toBeHostedStream)?.map(
										(stream) => ({
											title: stream.title || "--",
											duration: "--",
											isLive: stream.status === "live",
											artist: stream.createdById?.name,
											datetime: stream.scheduleDate || "2025-03-30T14:00:00",
											imageUrl: stream.artworkUrl || NFT_DETAIL_DEMO,
											id: stream._id,
											type: stream.type,
											stream: stream.streamId,
											status: stream.status
										})
									) || []
								}
							/>
						)}
					</div>
				</section>
			</div>
			<LiveStreamDetail />
		</main>
	)
}

export default FeaturedLivestream
