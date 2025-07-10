import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { addTopicComment } from "@/app/api/mutation"
import { PROFILE_IMAGE } from "@/assets"
import { TopicComment } from "@/types/communityTypes"
import { Button } from "@nextui-org/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { MessageCircle, X } from "lucide-react"

interface CommentSectionProps {
	comments: TopicComment[]
	topicId: string
	onCommentPost: () => void
}

export default function CommentSection({
	comments,
	topicId,
	onCommentPost
}: CommentSectionProps) {
	const [replyTo, setReplyTo] = useState<string | null>(null)
	const [replyText, setReplyText] = useState("")
	const [visibleReplies, setVisibleReplies] = useState<Set<string>>(new Set())
	const queryClient = useQueryClient()
	const router = useRouter()

	const { mutate: postComment, isPending: isPosting } = useMutation({
		mutationFn: () => {
			return addTopicComment(topicId, {
				content: replyText,
				...(replyTo && { parentCommentId: replyTo })
			})
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["topicById", topicId] })
			setReplyText("")
			setReplyTo(null)
			onCommentPost()
		}
	})

	const handleReplyClick = (commentId: string) => {
		setReplyTo(replyTo === commentId ? null : commentId)
	}

	const toggleReplies = (commentId: string) => {
		setVisibleReplies((prev) => {
			const newSet = new Set(prev)
			if (newSet.has(commentId)) {
				newSet.delete(commentId)
			} else {
				newSet.add(commentId)
			}
			return newSet
		})
	}

	const renderComment = (comment: TopicComment, isReply: boolean = false) => (
		<div key={comment._id} className="flex gap-4 py-3">
			<div
				className="flex-shrink-0 cursor-pointer"
				onClick={(e) => {
					e.stopPropagation()
					router.push(`/profile/${comment?.userId?._id}`)
				}}
			>
				<Image
					src={comment?.userId?.profile_img || PROFILE_IMAGE}
					alt={comment?.userId?.name || "Anonymous"}
					width={40}
					height={40}
					className="rounded-full"
				/>
			</div>
			<div className="flex-1 flex flex-col gap-1">
				<div
					className="flex items-center gap-2 cursor-pointer"
					onClick={(e) => {
						e.stopPropagation()
						router.push(`/profile/${comment?.userId?._id}`)
					}}
				>
					<span className="font-semibold text-[15px] leading-[24px] tracking-[-0.01em] text-textGray">
						{comment?.userId?.name || "Anonymous"}
					</span>
					<span className="font-semibold text-[13px] leading-[16px] tracking-[-0.01em] text-[#9A9FA5]">
						{format(new Date(comment?.createdAt || ""), "hh:mm a")}
					</span>
				</div>
				<p className="font-medium text-[15px] leading-[24px] tracking-[-0.01em] text-textPrimary">
					{comment?.content}
				</p>
				<div className="flex items-center gap-2 font-normal text-[10px] leading-none tracking-[-0.01em]">
					{!isReply && (
						<button
							className="text-textGray flex items-center gap-[6px]"
							onClick={() => handleReplyClick(comment._id)}
						>
							<span>
								<MessageCircle size={20} />
							</span>
							Reply
						</button>
					)}
					{comment.replies && comment.replies.length > 0 && (
						<button
							className="text-waveformBlue flex items-center gap-1"
							onClick={() => toggleReplies(comment._id)}
						>
							{comment.replies.length}{" "}
							{comment.replies.length === 1 ? "Reply" : "Replies"}
						</button>
					)}
				</div>

				{replyTo === comment._id && (
					<div className="mt-3 ml-4">
						<div className="border-2 border-[#EFEFEF] rounded-xl p-3 relative">
							<textarea
								className="w-full resize-none border-none focus:outline-none"
								placeholder="Write your reply..."
								value={replyText}
								onChange={(e) => setReplyText(e.target.value)}
							/>
							<div className="absolute bottom-3 right-3 flex gap-2">
								<Button
									color="default"
									variant="light"
									size="sm"
									onPress={() => setReplyTo(null)}
								>
									<X size={16} />
								</Button>
								<Button
									color="primary"
									size="sm"
									className="bg-[#00B207]"
									onPress={() => postComment()}
									isDisabled={!replyText.trim() || isPosting}
									isLoading={isPosting && replyTo === comment._id}
								>
									Reply
								</Button>
							</div>
						</div>
					</div>
				)}

				{comment.replies &&
					comment.replies.length > 0 &&
					visibleReplies.has(comment._id) && (
						<div className="mt-4 ml-4 flex flex-col gap-4">
							{comment.replies.map((reply: TopicComment) =>
								renderComment(reply, true)
							)}
						</div>
					)}
			</div>
		</div>
	)

	return (
		<div className="flex flex-col gap-6">
			{comments?.map((comment: TopicComment) => renderComment(comment))}
		</div>
	)
}
