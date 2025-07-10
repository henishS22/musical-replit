"use client"

import { useState, type FC } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { addComment } from "@/app/api/mutation"
// import { fetchTrackComments } from "@/app/api/query"
import { SEND_ICON_1 } from "@/assets"
import { Input, ScrollShadow } from "@nextui-org/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import moment from "moment"

import CommentAvatar from "./CommentAvatar"
import { Comment, Reply } from "./index"

interface CommentPopupProps {
	comment: Comment
	onReply: (commentId: string, replyText: string) => void
}

const CommentPopup: FC<CommentPopupProps> = ({ comment, onReply }) => {
	const [replyText, setReplyText] = useState("")
	const router = useRouter()

	const queryClient = useQueryClient()

	// const { data: trackComments } = useQuery({
	// 	queryKey: ["trackComments", comment.id],
	// 	queryFn: () => fetchTrackComments(comment.id),
	// 	enabled: !!comment.id
	// })

	const { mutate } = useMutation({
		mutationFn: (payload: Record<string, string>) => addComment(payload),
		onSuccess: (data) => {
			if (data) {
				queryClient.invalidateQueries({ queryKey: ["trackComments"] })
			}
		}
	})

	const handleReply = () => {
		if (replyText.trim()) {
			onReply(comment.id, replyText)
			const payload = {
				track_comment_id: comment.id,
				comment: replyText
			}
			mutate(payload)
			setReplyText("")
		}
	}

	return (
		<div className="w-64 max-h-80 flex flex-col">
			<div className="flex gap-2 items-center mb-2">
				<div
					className="flex items-center gap-2 cursor-pointer"
					onClick={() => {
						router.push(`/profile/${comment.user?._id}`)
					}}
				>
					<CommentAvatar initial={comment.user?.name?.[0] || "A"} />
					<span className="font-inter font-semibold text-[14px] leading-[16.94px] tracking-[0%] text-[#FFFFFF]">
						{comment?.user?.name || "Anonymous"}
					</span>
				</div>
				<div className="text-small text-foreground-400">
					{moment(comment.timestamp).fromNow().replace("minutes", "min")}
				</div>
			</div>

			<p className="font-inter font-medium text-[14px] leading-[16.94px] tracking-[0%] text-[#ffffffc2] ml-[30px]">
				{comment.text}
			</p>

			<ScrollShadow className="flex-grow">
				{comment.replies?.map((reply: Reply) => (
					<div key={reply.id} className="border-t border-divider pt-2 mt-2">
						<div
							className="flex items-center gap-2 mb-1 cursor-pointer"
							onClick={() => {
								router.push(`/profile/${reply.user?._id}`)
							}}
						>
							<CommentAvatar initial={reply.user?.name?.[0] || "A"} size="sm" />
							<span className="font-inter font-semibold text-[14px] leading-[16.94px] tracking-[0%] text-[#FFFFFF]">
								{reply.user?.name || "Anonymous"}
							</span>
							<span className="text-foreground-400 text-xs ml-2">
								{moment(reply.timestamp).fromNow().replace("minutes", "min")}
							</span>
						</div>
						<p className="font-inter font-medium text-[14px] leading-[16.94px] tracking-[0%] text-[#ffffffc2] pl-7">
							{reply.text}
						</p>
					</div>
				))}
			</ScrollShadow>

			<div className="flex gap-2 mt-2 relative">
				<Input
					type="text"
					value={replyText}
					onChange={(e) => setReplyText(e.target.value)}
					placeholder="Reply to comment..."
					className="h-8 text-sm flex-1"
					classNames={{
						inputWrapper: "text-[#FFFFFF] bg-[#8D8D8D] caret-color-[#FFFFFF]"
					}}
				/>

				<Image
					src={SEND_ICON_1}
					className="absolute right-[10px] top-[10px]"
					onClick={handleReply}
					alt="send"
					width={20}
					height={20}
				/>
			</div>
		</div>
	)
}

export default CommentPopup
