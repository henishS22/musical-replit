import Image, { StaticImageData } from "next/image"

import moment from "moment"

interface JumpBackCardProps {
	title: string
	timestamp: Date
	imageUrl: StaticImageData | string
}

export function JumpBackCard({
	title,
	timestamp,
	imageUrl
}: JumpBackCardProps) {
	return (
		<div className="w-[234px] h-[234px] bg-gray-100 rounded-lg overflow-hidden cursor-pointer">
			<div className="relative h-full">
				<Image src={imageUrl} alt={title} fill className="object-cover" />
				<div className="absolute inset-x-0 bottom-0 bg-white opacity-64 p-4">
					<h3 className="text-base font-medium text-black">{title}</h3>
					<p className="text-sm text-[#0D5326]">{`Edited ${moment(timestamp).fromNow().replace("minutes", "min")}`}</p>
				</div>
			</div>
		</div>
	)
}
