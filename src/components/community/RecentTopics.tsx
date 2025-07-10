import Image from "next/image"
import { useRouter } from "next/navigation"

import { PROFILE_IMAGE } from "@/assets"
import { Topic } from "@/types/communityTypes"
import { format } from "date-fns"

export default function RecentTopics({
	onDiscussionSelect,
	topics
}: {
	onDiscussionSelect: (id: string) => void
	topics: Topic[]
}) {
	const router = useRouter()

	// Filter and sort topics to get recent ones with valid forumId
	const recentTopics =
		topics.length > 0
			? topics
					?.filter((topic) => topic.forumId)
					.sort(
						(a, b) =>
							new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					)
					.slice(0, 3) // Show only last 3 topics
			: []

	return (
		<div className="border border-[#F4F4F4] rounded-xl p-[20px]">
			<h2 className="font-bold text-[15px] leading-6 tracking-[-0.01em] text-textPrimary mb-3">
				Recent Topics
			</h2>
			<div className="flex flex-col">
				{recentTopics?.map((topic, idx) => (
					<div
						key={idx}
						onClick={() => onDiscussionSelect?.(topic._id)}
						className="cursor-pointer"
					>
						<div className="flex flex-col gap-1">
							<h3 className="font-bold text-[12px] leading-6 tracking-[-0.01em] text-textPrimary">
								{topic.title}
							</h3>
							<div
								className="flex items-center gap-2 cursor-pointer"
								onClick={(e) => {
									e.stopPropagation()
									router.push(`/profile/${topic?.userId?._id}`)
								}}
							>
								<Image
									src={topic?.userId?.profile_img || PROFILE_IMAGE}
									alt={topic?.userId?.name || "Anonymous"}
									width={24}
									height={24}
									className="rounded-full object-cover"
								/>
								<span className="font-semibold text-[12px] leading-6 tracking-[-0.01em] text-textGray">
									By {topic?.userId?.name || "Anonymous"}
								</span>
							</div>
							<div className="font-medium text-[12px] leading-none tracking-[-0.01em] text-textGray">
								Started {format(new Date(topic?.createdAt), "MMM dd, yyyy")}
							</div>
						</div>
						{idx !== recentTopics?.length - 1 && (
							<div className="my-[10px] border-b border-[#F5F5F5]" />
						)}
					</div>
				))}
			</div>
		</div>
	)
}
