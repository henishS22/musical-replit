import { memo } from "react"
import Image from "next/image"

import { MediaPlayerProps } from "@/types"

interface TrackInfoProps {
	mediaPlayer: MediaPlayerProps | null
}

function TrackInfo({ mediaPlayer }: TrackInfoProps) {
	return (
		<div className="flex min-w-[200px] items-center gap-3">
			<Image
				src={mediaPlayer?.coverUrl || ""}
				alt={`${mediaPlayer?.title.slice(0, 5)} cover`}
				width={48}
				height={48}
				className="rounded-md object-cover"
			/>
			<div className="flex flex-col">
				<span className="text-sm font-medium">
					{mediaPlayer?.title?.slice(0, 10)}...
				</span>
				<span className="text-xs text-gray-400">{mediaPlayer?.artist}</span>
			</div>
		</div>
	)
}

export default memo(TrackInfo)
