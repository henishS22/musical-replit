import * as React from "react"
import Image from "next/image"

import { POINTS_ICON } from "@/assets"

interface PointsBadgeProps {
	points: number | string
}

const PointsBadge: React.FC<PointsBadgeProps> = ({ points }) => {
	return (
		<div className="flex items-center p-1 my-auto text-black bg-[#D6FFD1] rounded h-[27px] gap-1">
			<Image
				src={POINTS_ICON}
				alt=""
				className="object-contain shrink-0 my-auto w-4 aspect-square"
				height={24}
				width={24}
			/>
			<span className="my-auto font-bold text-[14px] leading-[100%] tracking-[0%] text-black">
				+{points} pt
			</span>
		</div>
	)
}

export default PointsBadge
