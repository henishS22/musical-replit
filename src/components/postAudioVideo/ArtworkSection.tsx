import Image from "next/image"

import { useDynamicStore } from "@/stores/dynamicStates"

import CustomTooltip from "../ui/tooltip"

const ArtworkSection = () => {
	const { trackId } = useDynamicStore()
	return (
		<div className="flex flex-col w-full flex-col gap-[14px]">
			<div className="flex items-center gap-1 text-[14px] font-semibold text-inputLabel leading-[24px] tracking-[-1.5%]">
				{trackId?.extension === "mp3" ? "Cover image" : "Video Thumbnail"}
				<span>
					<CustomTooltip
						tooltipContent={
							trackId?.extension === "mp3"
								? "Cover images are the images that will be displayed on the artwork of the post."
								: "Video thumbnails are the images that will be displayed on the thumbnail of the video."
						}
					/>
				</span>
			</div>

			<Image
				src={
					trackId?.artwork ||
					`${process.env.NEXT_PUBLIC_BASE_URL}/instrument/artwork.png`
				}
				alt="artwork"
				width={178}
				height={178}
				className="rounded-lg min-w-[178px] min-h-[178px] object-cover"
			/>
		</div>
	)
}

export default ArtworkSection
