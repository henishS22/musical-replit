import { Card, Skeleton } from "@nextui-org/react"

const StreamCardSkeleton = () => {
	return (
		<Card className="w-full rounded-lg shadow-none border border-[rgba(0,0,0,0.1)] p-4">
			<div className="flex flex-col gap-3">
				<div className="flex justify-between items-start">
					<Skeleton className="w-1/4 rounded-lg">
						<div className="h-5 rounded-lg bg-default-200"></div>
					</Skeleton>
					<Skeleton className="rounded-lg px-2 py-1">
						<div className="h-5 w-12 rounded-lg bg-default-200"></div>
					</Skeleton>
				</div>

				<Skeleton className="w-2/5 rounded-lg">
					<div className="h-4 rounded-lg bg-default-200"></div>
				</Skeleton>

				<div className="flex gap-3 bg-hoverGray p-3 rounded-lg">
					<Skeleton className="rounded-lg">
						<div className="h-[100px] w-[100px] rounded-lg bg-default-300"></div>
					</Skeleton>
					<div className="flex-1 space-y-3">
						<Skeleton className="w-3/4 rounded-lg">
							<div className="h-6 rounded-lg bg-default-200"></div>
						</Skeleton>
						<Skeleton className="w-full rounded-lg">
							<div className="h-16 rounded-lg bg-default-200"></div>
						</Skeleton>
					</div>
				</div>

				<Skeleton className="w-24 rounded-lg">
					<div className="h-10 rounded-lg bg-default-300"></div>
				</Skeleton>
			</div>
		</Card>
	)
}

export default StreamCardSkeleton
