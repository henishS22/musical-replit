import React from "react"

import { Skeleton } from "@nextui-org/react"

const ALaCarteTableSkeleton = () => {
	return (
		<div className="mt-16 max-w-[1200px] mx-auto px-4">
			<div className="text-center mb-8">
				<Skeleton className="h-[40px] w-[200px] rounded-lg mb-4 mx-auto" />
				<Skeleton className="h-[20px] w-[600px] rounded-lg mb-8 mx-auto" />
			</div>
			<div className="w-full rounded-md overflow-hidden">
				<div className="min-w-full border-collapse">
					<div className="bg-transparent text-[#111827] px-8 py-5 font-bold text-[30px] leading-[100%] text-textPrimary border border-[#e5e7eb] border-b-0 !text-left">
						<Skeleton className="h-[30px] w-full rounded-lg" />
					</div>
					{Array(3)
						.fill(null)
						.map((_, i) => (
							<div
								key={i}
								className="flex gap-4 items-center mb-4 border border-[#e5e7eb] py-[14px] px-8"
							>
								<Skeleton className="h-[24px] w-full rounded-lg" />
								<Skeleton className="h-[24px] w-full rounded-lg" />
								<Skeleton className="h-[24px] w-full rounded-lg" />
								<Skeleton className="h-[24px] w-full rounded-lg" />
								<Skeleton className="h-[24px] w-full rounded-lg" />
							</div>
						))}
				</div>
			</div>
		</div>
	)
}

export default ALaCarteTableSkeleton
