"use client"

import * as React from "react"

import { Skeleton } from "@nextui-org/react"

function MarketQuestCardSkeleton({ showAll }: { showAll: boolean }) {
	return (
		<div className={`flex gap-6 mt-6 ${showAll ? "flex-col" : "flex-row"}`}>
			{[...Array(3)].map((_, index) => (
				<div
					className="flex flex-col flex-1 shrink justify-center p-3 rounded-xl border border-solid basis-0 bg-zinc-50 border-zinc-100 min-w-60 w-full"
					key={index}
				>
					{/* Header */}
					<header className="flex flex-wrap gap-3 justify-between items-center w-full font-bold">
						<div className="flex gap-3 items-center">
							<Skeleton className="w-6 h-6 rounded-md" />
							<Skeleton className="w-40 h-4 rounded-md" />
						</div>
						<Skeleton className="w-12 h-6 rounded-md" />
					</header>

					{/* Description */}
					<div className="mt-6">
						<Skeleton className="w-full h-4 rounded-md mb-2" />
						<Skeleton className="w-[90%] h-4 rounded-md mb-2" />
						<Skeleton className="w-[70%] h-4 rounded-md" />
					</div>

					{/* Footer */}
					<footer className="flex justify-between items-end mt-6 w-full text-sm tracking-tight">
						<div className="flex shrink gap-2 items-center basis-0">
							<Skeleton className="w-[34px] h-[34px] rounded-full" />
							<Skeleton className="w-24 h-4 rounded-md" />
						</div>
						<Skeleton className="w-20 h-4 rounded-md" />
					</footer>
				</div>
			))}
		</div>
	)
}

export default MarketQuestCardSkeleton
