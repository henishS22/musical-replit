import React from "react"

import { Skeleton } from "@nextui-org/react"

const SubscriptionCardSkeleton = () => {
	return (
		<div
			className={`min-w-[346px] max-w-[380px] h-[929px] px-6 py-[40px] border border-[#1DB954] rounded-md`}
		>
			<div className="flex flex-col gap-[40px]">
				<div className="flex flex-col gap-5">
					<div className="flex flex-col gap-[11px]">
						<Skeleton className="h-[22px] w-[150px] rounded-lg mb-4" />
						<Skeleton className="h-[16px] w-[250px] rounded-lg mb-6" />
					</div>
					<div className="flex flex-col gap-6">
						<Skeleton className="h-[56px] w-[150px] rounded-lg mb-4" />
						<Skeleton className="h-[40px] w-full rounded-lg mb-8" />
					</div>
				</div>
				<div className="flex flex-col gap-3">
					{Array(5)
						.fill(null)
						.map((_, j) => (
							<div key={j} className="flex items-center gap-[17px]">
								<Skeleton className="h-4 w-4 rounded-full" />
								<Skeleton className="h-[16px] w-full rounded-lg" />
							</div>
						))}
				</div>
			</div>
		</div>
	)
}

export default SubscriptionCardSkeleton
