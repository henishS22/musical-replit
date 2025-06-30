"use client"

import * as React from "react"

import { Skeleton } from "@nextui-org/react"

function MissionCardSeketon() {
	return (
		<div className="flex flex-col gap-6 mt-6">
			{[...Array(3)].map((_, index) => (
				<article
					className="flex justify-center items-start w-full max-md:max-w-full"
					key={index}
				>
					<div className="flex flex-wrap flex-1 shrink gap-6 items-center p-3 w-full border border-[#EFEFEF] rounded-[12px] border-solid basis-0 bg-zinc-50 min-w-60 max-md:max-w-full">
						{/* Icon Skeleton */}
						<Skeleton className="w-6 h-6 rounded-md" />

						{/* Title Skeleton */}
						<div className="flex-1 shrink my-auto basis-8 min-w-60 max-md:max-w-full">
							<Skeleton className="w-40 h-4 rounded-md" />
						</div>

						{/* Points Badge Skeleton */}
						<Skeleton className="w-12 h-6 rounded-md" />

						{/* Start Button Skeleton */}
						<div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-lg">
							<Skeleton className="w-4 h-4 rounded-sm" />
							<Skeleton className="w-14 h-4 rounded-sm" />
						</div>
					</div>
				</article>
			))}
		</div>
	)
}

export default MissionCardSeketon
