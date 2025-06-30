import React from "react"
import Image, { StaticImageData } from "next/image"

import { LIVESTREAM_DETAIL_MODAL } from "@/constant/modalType"
import { format } from "date-fns"

import { useDynamicStore } from "@/stores"
import { useModalStore } from "@/stores/modal"

export interface LivestreamData {
	title: string
	duration: string
	isLive?: boolean
	artist: string
	datetime: string
	imageUrl: string | StaticImageData
	id: string
	type: string
	stream: string
	status: string
}

interface LivestreamCardProps {
	stream: LivestreamData
}

export const LivestreamCard: React.FC<LivestreamCardProps> = ({ stream }) => {
	const { showCustomModal } = useModalStore()
	const { addState } = useDynamicStore()

	const handleClick = ({ id }: { id: string }) => {
		addState(
			"streamType",
			stream.type === "audio_room" ? "audio_room" : "livestream"
		)
		showCustomModal({
			customModalType: LIVESTREAM_DETAIL_MODAL,
			tempCustomModalData: {
				id: id
			}
		})
	}

	return (
		<article
			className="items-stretch border cursor-pointer border-[#1DB954] bg-[#FCFCFC] flex min-w-60 flex-col overflow-hidden justify-center w-[244px] p-3 rounded-lg border-solid"
			onClick={() => handleClick({ id: stream.stream })}
		>
			<div className="w-full max-w-[220px]">
				<Image
					src={stream.imageUrl}
					alt={stream.title}
					className="aspect-[1.02] object-contain w-full rounded"
					width={220}
					height={220}
				/>

				<div className="flex w-full items-center text-[#1A1D1F] justify-center mt-2">
					<div className="self-stretch flex min-h-8 gap-5 leading-[1.6] justify-between flex-1">
						<h3 className="text-xl font-semibold tracking-[-0.4px] max-w-[200px] truncate">
							{stream.title}
						</h3>
					</div>
					{stream.status === "live" && (
						<div className="self-stretch flex items-center gap-3 text-xs font-semibold whitespace-nowrap tracking-[-0.12px] leading-6 my-auto">
							<div className="self-stretch flex items-center gap-1 my-auto">
								<div className="self-stretch flex w-3 shrink-0 h-3 my-auto rounded-[18px] bg-red-500" />
								<span className="self-stretch my-auto">Live</span>
							</div>
						</div>
					)}
				</div>

				<div className="flex w-full flex-col leading-6 mt-2">
					<div className="flex items-center gap-3 text-sm">
						<div className="self-stretch flex items-center gap-1 my-auto">
							<span className="text-[#6F767E] font-medium tracking-[-0.21px]">
								by
							</span>
							<span className="text-[#1A1D1F] font-semibold tracking-[-0.14px]">
								{stream.artist}
							</span>
						</div>
					</div>
					<div className="flex items-center gap-3 text-xs text-[#1A1D1F] font-semibold tracking-[-0.12px]">
						<time
							dateTime={stream.datetime}
							className="self-stretch gap-1 my-auto"
						>
							{format(new Date(stream.datetime), "do MMMM yyyy, hh:mm aa")}
						</time>
					</div>
				</div>
			</div>
		</article>
	)
}
