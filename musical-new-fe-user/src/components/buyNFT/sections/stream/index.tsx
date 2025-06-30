import { fetchNftPrivateStreams } from "@/app/api/query"
import StreamCardSkeleton from "@/components/skeletons/StreamCardSkeleton"
import { NoDataFound } from "@/components/ui"
import { useQuery } from "@tanstack/react-query"

import { StreamCard } from "./StreamCard"

interface StreamProps {
	nftId: string
	signature: string
}

export const Stream: React.FC<StreamProps> = ({ nftId, signature }) => {
	const { data: streams, isLoading } = useQuery({
		queryKey: ["nftPrivateStreams", nftId],
		queryFn: () => fetchNftPrivateStreams(nftId),
		enabled: !!nftId
	})

	if (isLoading) {
		return (
			<div className="p-4">
				<div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
					{[1, 2, 3].map((index) => (
						<StreamCardSkeleton key={index} />
					))}
				</div>
			</div>
		)
	}

	return (
		<div className="p-4">
			<div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
				{streams && streams?.data?.length > 0 ? (
					streams?.data?.map((stream) => (
						<StreamCard
							signature={signature}
							key={stream._id}
							streamId={stream.streamId}
							title={stream.title}
							description={stream.description}
							artworkUrl={stream.artworkUrl}
							scheduleDate={stream.scheduleDate}
							status={stream.status}
						/>
					))
				) : (
					<div className="text-center text-gray-500 h-[400px] flex items-center justify-center">
						<NoDataFound message="No streams found" />
					</div>
				)}
			</div>
		</div>
	)
}
