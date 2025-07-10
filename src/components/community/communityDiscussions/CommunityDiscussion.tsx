"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { addTopicComment } from "@/app/api/mutation"
import { fetchTopicById } from "@/app/api/query"
import { PROFILE_IMAGE } from "@/assets"
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb"
import { formatRelativeTime } from "@/helpers/formatDateHelpers"
import { Button, Skeleton } from "@nextui-org/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"

import CommunityHeader from "../CommunityHeader"
import CommentSection from "./CommentSection"

interface CommunityDiscussionProps {
	topicId: string
	onBack: () => void
}

const TopicSkeleton = () => (
	<div className="flex flex-col gap-6">
		{/* Topic Info Skeleton */}
		<div className="border border-[#F4F4F4] rounded-lg p-6">
			<Skeleton className="h-8 w-3/4 mb-4 rounded-lg" />
			<div className="flex items-center gap-2 mb-4">
				<Skeleton className="h-5 w-5 rounded-full" />
				<Skeleton className="h-4 w-32 rounded-lg" />
			</div>
			<Skeleton className="h-24 w-full rounded-lg" />
		</div>
	</div>
)

export default function CommunityDiscussion({
	topicId,
	onBack
}: CommunityDiscussionProps) {
	const [comment, setComment] = useState("")
	const queryClient = useQueryClient()
	const router = useRouter()

	const { data: topic, isPending } = useQuery({
		queryKey: ["topicById", topicId],
		queryFn: () => fetchTopicById(topicId),
		refetchInterval: 10000
	})

	const { mutate: postComment, isPending: isPosting } = useMutation({
		mutationFn: () => addTopicComment(topicId, { content: comment }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["topicById"] })
			queryClient.invalidateQueries({ queryKey: ["topics"] })
			setComment("")
		}
	})

	return (
		<div className="flex flex-col gap-6 mt-6">
			<CommunityHeader />
			{isPending ? (
				<Skeleton className="h-[40px] max-w-[400px] rounded-lg" />
			) : (
				<Breadcrumb
					title="Community Forum"
					dropdownConfig={{
						isStaticIcon: false,
						isStatic: true,
						activeLabel: topic?.title || "",
						value: "",
						options: [],
						onChange: () => {}
					}}
					onBack={onBack}
				/>
			)}
			<div className="flex gap-6">
				<div className="flex-[2] max-w-[1148px]">
					<div className="bg-white rounded-xl flex flex-col gap-3">
						<div className="max-h-[calc(100vh-250px)] overflow-y-auto scrollbar flex flex-col gap-3">
							{isPending ? (
								<TopicSkeleton />
							) : (
								<>
									{/* Topic Header */}
									<div className="border border-[#F4F4F4] rounded-lg py-3 px-6 flex flex-col gap-2">
										<h1 className="font-bold text-[18px] leading-[24px] tracking-[-0.01em] text-textPrimary">
											{topic?.title}
										</h1>

										<div
											className="flex items-center gap-2 cursor-pointer"
											onClick={(e) => {
												e.stopPropagation()
												router.push(`/profile/${topic?.userId?._id}`)
											}}
										>
											<div className="flex-shrink-0">
												<Image
													src={topic?.userId?.profile_img || PROFILE_IMAGE}
													alt={topic?.userId?.name || ""}
													width={20}
													height={20}
													className="rounded-full"
												/>
											</div>
											<div className="flex items-center gap-3">
												<span className="font-semibold text-[12px] leading-[24px] tracking-[-0.01em] text-textGray">
													By {topic?.userId?.name || "Anonymous"}
												</span>
												<span className="font-semibold text-[10px] leading-[16px] tracking-[-0.01em] text-[#9A9FA5]">
													{format(new Date(topic?.createdAt || ""), "hh:mm a")}
												</span>
											</div>
										</div>

										<div
											className="highlight-links font-manrope font-medium text-[14px] leading-[24px] tracking-[-0.01em] text-textGray"
											dangerouslySetInnerHTML={{
												__html: topic?.description || ""
											}}
										/>
									</div>

									{/* Comments Section */}
									<CommentSection
										comments={topic?.comments || []}
										topicId={topicId}
										onCommentPost={() =>
											queryClient.invalidateQueries({
												queryKey: ["topicById", topicId]
											})
										}
									/>
								</>
							)}
						</div>

						{!isPending && (
							<div>
								<h3 className="font-bold text-[18px] leading-6 tracking-[0.01em] text-textPrimary mb-3">
									Reply to this topic
								</h3>
								<div className="border-2 border-[#EFEFEF] rounded-xl p-3 max-h-[110px] min-h-[110px] relative">
									<textarea
										className="w-full resize-none border-none focus:outline-none"
										placeholder="Write your reply..."
										value={comment}
										onChange={(e) => setComment(e.target.value)}
									/>
									<div className="absolute bottom-3 right-3">
										<Button
											color="primary"
											className="bg-[#1DB954] font-bold text-[13px] leading-6 tracking-[0.01em] text-white py-2 px-4 rounded-lg"
											onPress={() => postComment()}
											isDisabled={!comment.trim() || isPosting}
											isLoading={isPosting}
										>
											Reply
										</Button>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
				{!isPending ? (
					<div className="flex-1 border border-[#F4F4F4] rounded-xl px-6 py-3 max-h-fit max-w-[339px]">
						<h2 className="font-bold text-[15px] leading-[24px] tracking-[-0.01em] text-textPrimary mb-4">
							About this topic
						</h2>
						<div className="flex flex-col gap-2 text-sm text-textGray">
							<div>
								In:{" "}
								<span className="text-waveformBlue">
									{" "}
									{topic?.forumId?.name || ""}{" "}
								</span>
							</div>
							<div>{topic?.participants?.length || 0} participants</div>
							<div>{topic?.repliesCount || 0} replies</div>
							<div>
								Last Activity{" "}
								<span className="text-waveformBlue">
									{topic?.lastActivity
										? formatRelativeTime(topic?.lastActivity)
										: "N/A"}
								</span>
							</div>
							{topic?.lastReplyFrom && (
								<div>
									Latest reply from{" "}
									<span className="text-waveformBlue">
										{topic?.lastReplyFrom?.name}
									</span>
								</div>
							)}
						</div>
					</div>
				) : (
					<Skeleton className="h-[198px] flex-1 rounded-lg max-w-[339px]" />
				)}
			</div>
		</div>
	)
}
