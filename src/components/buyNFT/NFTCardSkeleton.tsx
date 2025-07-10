"use client"

import { Skeleton } from "@nextui-org/react"

const BuyNftCardSkeleton = () => {
	return (
		<div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
			<div className="flex gap-10">
				<div className="w-[466px] h-[472px]">
					<Skeleton className="rounded-xl w-full h-full" />
				</div>
				<div className="flex-1 flex flex-col gap-10">
					<div className="space-y-3">
						<div className="flex items-center gap-3">
							<Skeleton className="w-8 h-8 rounded-full" />
							<Skeleton className="w-32 h-6 rounded-lg" />
						</div>
						<Skeleton className="w-3/4 h-10 rounded-lg" />
						<Skeleton className="w-full h-24 rounded-lg" />
					</div>
					<Skeleton className="w-32 h-10 rounded-lg mb-4" />
					<Skeleton className="w-48 h-12 rounded-xl" />
					<Skeleton className="w-64 h-8 rounded-lg" />
				</div>
			</div>
		</div>
	)
}

export default BuyNftCardSkeleton
