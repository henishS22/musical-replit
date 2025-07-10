"use client"

import { FC } from "react"

import { Skeleton } from "@nextui-org/react"

interface StreamSkeletonProps {
	type: "livestream" | "audio_room"
}

const StreamSkeleton: FC<StreamSkeletonProps> = ({ type }) => {
	return (
		<div className="bg-gray-100 py-8">
			{type === "livestream" ? (
				<div className="bg-white rounded-xl shadow-lg p-6">
					<div className="flex flex-col gap-6">
						{/* Header */}
						<div className="border-b pb-4">
							<Skeleton className="h-8 w-32 rounded-lg" />
							<Skeleton className="h-4 w-24 rounded-lg mt-2" />
						</div>

						{/* Video Layout */}
						<Skeleton className="aspect-video rounded-lg" />

						{/* Controls */}
						<div className="border-t pt-4 flex justify-between">
							<Skeleton className="h-10 w-32 rounded-lg" />
							<Skeleton className="h-10 w-28 rounded-lg" />
						</div>
					</div>
				</div>
			) : (
				<div className="bg-white rounded-xl shadow-lg p-6">
					<div className="flex flex-col gap-6">
						{/* Room Header */}
						<div className="border-b pb-4">
							<Skeleton className="h-8 w-32 rounded-lg" />
							<Skeleton className="h-4 w-24 rounded-lg mt-2" />
						</div>

						{/* Speaker Requests Section */}
						<div className="space-y-4">
							<div className="flex items-center gap-2">
								<Skeleton className="h-6 w-32 rounded-lg" />
								<Skeleton className="h-5 w-5 rounded-full" />
							</div>
							<div className="space-y-2">
								{[1, 2].map((i) => (
									<div
										key={i}
										className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
									>
										<div className="flex items-center gap-3">
											<Skeleton className="w-10 h-10 rounded-full" />
											<Skeleton className="h-4 w-24 rounded-lg" />
										</div>
										<div className="flex gap-2">
											<Skeleton className="h-8 w-16 rounded-lg" />
											<Skeleton className="h-8 w-16 rounded-lg" />
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Speakers Section */}
						<div className="space-y-4">
							<Skeleton className="h-6 w-32 rounded-lg" />
							<div className="grid grid-cols-3 gap-4">
								{[1, 2, 3].map((i) => (
									<div key={i} className="text-center">
										<Skeleton className="w-16 h-16 mx-auto rounded-full mb-2" />
										<Skeleton className="h-4 w-20 mx-auto rounded-lg" />
									</div>
								))}
							</div>
						</div>

						{/* Listeners Section */}
						<div className="space-y-4">
							<Skeleton className="h-6 w-32 rounded-lg" />
							<div className="grid grid-cols-4 gap-3">
								{[1, 2, 3, 4].map((i) => (
									<div key={i} className="text-center">
										<Skeleton className="w-12 h-12 mx-auto rounded-full mb-1" />
										<Skeleton className="h-3 w-16 mx-auto rounded-lg" />
									</div>
								))}
							</div>
						</div>

						{/* Room Controls */}
						<div className="border-t pt-4">
							<Skeleton className="h-10 w-full rounded-lg mb-4" />
							<div className="flex justify-end">
								<Skeleton className="h-10 w-32 rounded-lg" />
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default StreamSkeleton
