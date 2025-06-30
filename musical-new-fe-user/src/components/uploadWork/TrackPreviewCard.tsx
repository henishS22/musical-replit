import React, { useEffect, useState } from "react"
import Image from "next/image"

import { getVideoThumbnail } from "@/helpers"
import { PreviewCardProps } from "@/types"

import { useDynamicStore, useModalStore } from "@/stores"

import "./styles.css"

import { AUDIO_VIDEO_MODAL } from "@/constant/modalType"
import { CirclePlay } from "lucide-react"

const TrackPreviewCard: React.FC<PreviewCardProps> = ({
	artworkSrc,
	artworkHeight = 100,
	artworkWidth = 100,
	title,
	duration,
	avatarSrc,
	artistName,
	containerClassName = "",
	trackId
}) => {
	const [thumbnail, setThumbnail] = useState<string | null>("")
	const { showCustomModal } = useModalStore()
	const { addState } = useDynamicStore()
	const getThumbnailImage = async () => {
		const thumbnailImage = await getVideoThumbnail(trackId?.file)
		setThumbnail(thumbnailImage as string)
	}

	useEffect(() => {
		if (trackId?.file) {
			getThumbnailImage()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trackId])

	return (
		<div
			className={`flex flex-col mt-6 w-full max-w-[292px] ${containerClassName}`}
		>
			{trackId?.file || trackId?.url ? (
				<>
					<div className="flex overflow-hidden flex-col justify-center items-center w-full bg-violet-300 rounded-xl max-md:px-5 relative h-[200px]">
						{/* Disk Image with Conditional Rotation */}
						<Image
							loading="lazy"
							src={
								trackId?.mediaType === "video"
									? thumbnail || artworkSrc
									: artworkSrc
							}
							alt="Preview artwork"
							width={artworkWidth}
							height={artworkHeight}
							className={`object-contain h-full w-full z-10`}
						/>
						<div
							className="absolute inset-0 bg-cover bg-center blur-md"
							style={{ backgroundImage: `url(${artworkSrc})` }}
						></div>
						<CirclePlay
							className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-4xl cursor-pointer z-20"
							size={50}
							onClick={() => {
								showCustomModal({ customModalType: AUDIO_VIDEO_MODAL })
								addState("url", trackId?.file)
							}}
						/>
					</div>

					<div className="flex gap-4 items-start mt-4 w-full leading-relaxed">
						<div className="flex flex-col flex-1 shrink w-full basis-0 min-w-[240px]">
							<div className="flex gap-10 justify-between items-start w-full text-zinc-900">
								<div
									className="text-xl font-semibold tracking-tight max-w-[200px] truncate overflow-hidden text-ellipsis"
									title={trackId?.fileName || title}
								>
									{trackId?.fileName || title}
								</div>
								{duration ? (
									<div className="overflow-hidden px-2 py-1 text-base font-bold tracking-normal text-center bg-green-200 rounded-md">
										{(Number(duration) / 100).toFixed(2)}
									</div>
								) : null}
							</div>
							<div className="flex gap-3 items-center self-start mt-2 text-base">
								<Image
									loading="lazy"
									src={avatarSrc}
									alt="Artist avatar"
									className="object-contain shrink-0 self-stretch my-auto w-8 aspect-square rounded-full"
									width={32}
									height={32}
								/>
								<div className="flex gap-1 items-center self-stretch my-auto">
									<span className="self-stretch my-auto font-medium tracking-tight text-gray-500">
										by
									</span>
									<span className="self-stretch my-auto font-semibold tracking-normal text-zinc-900">
										{artistName}
									</span>
								</div>
							</div>
						</div>
					</div>
				</>
			) : (
				<div className="flex flex-col justify-center items-center py-12 w-full bg-grey rounded-xl max-md:px-5 relative">
					<div className="text-xl font-semibold tracking-tight">
						No Preview Available
					</div>
				</div>
			)}
		</div>
	)
}

export default TrackPreviewCard
