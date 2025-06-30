import { Skeleton } from "@nextui-org/react"

const PlatformSkeleton = () => (
	<div className="flex flex-col gap-6 mt-6">
		{[...Array(3)].map((_, index) => (
			<article
				className="flex justify-center items-start w-full max-md:max-w-full"
				key={index}
			>
				<div className="flex flex-wrap flex-1 shrink gap-6 items-center p-3 w-full rounded-xl border border-solid basis-0 bg-zinc-50 border-zinc-100 min-w-60 max-md:max-w-full">
					{/* Title skeleton */}
					<div className="flex-1 shrink self-stretch my-auto text-base basis-8 min-w-60 max-md:max-w-full">
						<Skeleton className="w-48 h-4 rounded-[4px]" />
					</div>

					{/* Points and timestamp skeleton */}
					<div className="flex items-center gap-6">
						{/* Badge skeleton */}
						<Skeleton className="w-10 h-6 rounded-[4px]" />

						{/* Timestamp skeleton */}
						<Skeleton className="w-24 h-4 rounded-[4px]" />
					</div>
				</div>
			</article>
		))}
	</div>
)

export default PlatformSkeleton
