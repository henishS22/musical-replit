"use client"

import Image from "next/image"

import { ChatMessage } from "@/types/chat"
import moment from "moment"

interface MessageProps {
	message: ChatMessage
	isLast: boolean
}

export function Message({ message, isLast }: MessageProps) {
	return (
		<div>
			<div className="flex gap-3 p-3 items-center rounded-xl hover:bg-hoverGray cursor-pointer relative">
				<div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
					<Image
						src={message.user.image}
						alt="avatar"
						width={64}
						height={64}
						className="object-cover"
					/>
				</div>
				<div className="flex-1 ml-3">
					<div className="flex items-center gap-2">
						<span className="font-bold text-[15px] leading-6 tracking-[-0.01em] text-textPrimary">
							{message.user.name}
						</span>
						<span className="text-textGray text-[13px] leading-[16px] tracking-[-0.01em]">
							{moment(message.created_at).format("DD MMMM YYYY, HH:mm")}
						</span>
					</div>
					{message.text && (
						<p className="text-textPrimary font-normal text-[15px] leading-[24px] tracking-[-0.01em] mt-2">
							{message.text}
						</p>
					)}
				</div>
			</div>
			{!isLast && (
				<div>
					<div className="h-[1px] bg-[#EFEFEF]" />
				</div>
			)}
		</div>
	)
}
