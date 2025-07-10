import { Skeleton } from "@nextui-org/react"

export const LoadingSkeleton = () => (
	<>
		<div className="flex flex-col gap-2 p-4 border border-gray-200 rounded-lg w-[244px]">
			<Skeleton className="rounded-lg w-full">
				<div className="h-[200px] rounded-lg bg-default-300"></div>
			</Skeleton>
			<div className="space-y-3">
				<Skeleton className="w-3/5 rounded-lg">
					<div className="h-3 w-3/5 rounded-lg bg-default-300"></div>
				</Skeleton>
				<Skeleton className="w-4/5 rounded-lg">
					<div className="h-3 w-4/5 rounded-lg bg-default-300"></div>
				</Skeleton>
			</div>
		</div>
	</>
)
