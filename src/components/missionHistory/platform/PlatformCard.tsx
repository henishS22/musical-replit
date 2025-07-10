import * as React from "react"

import PointsBadge from "@/components/viewProfile/missions/PointsBadge"
import moment from "moment"

interface PlatformCardProps {
	title: string
	points: number
	updatedAt: string
}

export function PlatformCard({ title, points, updatedAt }: PlatformCardProps) {
	return (
		<article className="flex justify-center items-start w-full max-md:max-w-full">
			<div className="flex flex-wrap flex-1 shrink gap-6 items-center p-3 w-full rounded-xl border border-solid basis-0 bg-zinc-50 border-zinc-100 min-w-60 max-md:max-w-full">
				<h2 className="flex-1 shrink self-stretch my-auto text-base basis-8 min-w-60 max-md:max-w-full font-bold text-[16px] leading-[100%] tracking-[0%] text-[#1A1D1F]">
					{title}
				</h2>
				<div className="flex items-center gap-6">
					<PointsBadge points={points} />
					<div
						className="font-medium text-[14px] leading-[100%] tracking-[-2%] text-[#949494]
"
					>
						{moment(updatedAt).format("DD MMM YY | HH:mm")}
					</div>
				</div>
			</div>
		</article>
	)
}
