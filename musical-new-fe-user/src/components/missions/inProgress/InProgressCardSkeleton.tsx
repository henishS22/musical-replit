"use client"

import * as React from "react"

import { Skeleton } from "@nextui-org/react"

export function InProgressCardSkeleton() {
	return (
		<div className="flex flex-col gap-6 mt-6">
			{[...Array(3)].map((_, index) => (
				<article
					className="flex flex-col justify-center p-3 w-full rounded-xl border border-solid bg-zinc-50 border-zinc-100 max-md:max-w-full"
					key={index}
				>
					{/* Header Section */}
					<header className="flex flex-wrap gap-6 items-center w-full text-sm font-bold max-md:max-w-full">
						{/* Icon */}
						<Skeleton className="w-6 h-6 rounded-md" />

						{/* Heading */}
						<div className="flex-1 shrink basis-0 min-w-60 max-md:max-w-full">
							<Skeleton className="w-40 h-6 rounded-md" />
						</div>

						{/* Date */}
						<Skeleton className="w-20 h-6 rounded-md" />

						{/* Points Badge */}
						<Skeleton className="w-12 h-6 rounded-md" />
					</header>

					{/* Description + Button */}
					<div className="flex mt-2 justify-between max-md:max-w-full w-full">
						{/* Description */}
						<div className="w-[60%] rounded-md max-md:w-full gap-[2px]">
							<Skeleton className="h-3 rounded-md max-md:w-full" />
							<Skeleton className="h-3 rounded-md max-md:w-full" />
						</div>

						{/* Publish/Unpublish Button */}
						<Skeleton className="w-[20%] h-8 rounded-lg bg-green-100" />
					</div>
				</article>
			))}
		</div>
	)
}

export default InProgressCardSkeleton
