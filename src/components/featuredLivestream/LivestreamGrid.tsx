import React from "react"

import { NoDataFound } from "../ui/noDataFound"
import { LivestreamCard, LivestreamData } from "./LivestreamCard"

interface LivestreamGridProps {
	streams: LivestreamData[]
}

export const LivestreamGrid: React.FC<LivestreamGridProps> = ({ streams }) => {
	return (
		<div className="flex w-full gap-[22px] flex-wrap mt-3 max-md:max-w-full">
			{streams.length > 0 ? (
				streams.map((stream, index) => (
					<LivestreamCard key={`${stream.title}-${index}`} stream={stream} />
				))
			) : (
				<div className="flex items-center justify-center min-h-[300px] h-full w-full">
					<NoDataFound message="No streams found" />
				</div>
			)}
		</div>
	)
}
