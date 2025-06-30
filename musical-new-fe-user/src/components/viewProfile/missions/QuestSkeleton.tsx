"use client"

import * as React from "react"

import { Skeleton } from "@nextui-org/react"

const QuestSkeleton: React.FC = () => {
	return (
		<article className="flex flex-col justify-center p-3 w-full rounded-xl border border-solid bg-zinc-50 border-zinc-100 max-md:max-w-full">
			{/* Header Skeleton */}
			<header className="flex flex-wrap gap-6 items-center w-full max-md:max-w-full">
				<Skeleton className="w-6 h-6 rounded-md" />
				<Skeleton className="flex-1 h-4 rounded-md min-w-60" />
				<Skeleton className="w-24 h-4 rounded-md" />
				<Skeleton className="w-12 h-6 rounded-md" />
			</header>

			{/* Message Skeleton */}
			<div className="mt-2 space-y-2">
				<Skeleton className="w-full h-4 rounded-md" />
				<Skeleton className="w-[80%] h-4 rounded-md" />
				<Skeleton className="w-[60%] h-4 rounded-md" />
			</div>
		</article>
	)
}

export default QuestSkeleton
