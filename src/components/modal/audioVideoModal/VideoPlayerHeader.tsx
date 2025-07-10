import Image from "next/image"

import { PROFILE_IMAGE } from "@/assets"
import { VideoPlayerHeaderProps } from "@/types/customMediaPlayer"

// import { X } from "lucide-react"

// import { useModalStore } from "@/stores"

export const VideoPlayerHeader = ({
	authorImage,
	authorName,
	videoTitle
}: VideoPlayerHeaderProps) => {
	// const { hideCustomModal } = useModalStore()
	return (
		<div className="flex flex-wrap gap-5 justify-between items-center w-full max-md:max-w-full">
			<div className="flex gap-3 justify-center items-center self-stretch my-auto text-base leading-relaxed">
				<div className="flex gap-3 items-center self-stretch my-auto">
					<Image
						src={authorImage || PROFILE_IMAGE.src}
						alt={`profile`}
						width={32}
						height={32}
						className="object-contain shrink-0 self-stretch my-auto w-8 aspect-square rounded-full"
					/>
					<div className="flex gap-1 items-center self-stretch my-auto">
						<div className="self-stretch my-auto font-medium tracking-tight text-gray-500">
							by
						</div>
						<div className="self-stretch my-auto font-semibold tracking-normal text-zinc-900">
							{authorName}
						</div>
					</div>
				</div>
			</div>
			<div className="self-stretch my-auto text-xl font-semibold tracking-tight leading-relaxed text-center text-zinc-900 absolute left-1/2 -translate-x-1/2">
				{videoTitle}
			</div>
			{/* <div className="flex gap-4 items-start self-stretch">
				<div
					className="flex gap-2.5 justify-center items-center px-2.5 w-10 h-10 bg-white shadow-sm rounded-[36px] cursor-pointer"
					onClick={hideCustomModal}
				>
					<X />
				</div>
			</div> */}
		</div>
	)
}
