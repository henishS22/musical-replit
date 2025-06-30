"use client"

import { forwardRef } from "react"

import { ChatMessage } from "@/types/chat"
import { Button } from "@nextui-org/react"
import { Loader } from "lucide-react"

import { Message } from "./Message"

interface MessageListProps {
	messages: ChatMessage[]
	onScroll: () => void
	showLoadMore: boolean
	isLoading: boolean
	onLoadMore: () => void
}

export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
	({ messages, onScroll, showLoadMore, isLoading, onLoadMore }, ref) => (
		<div
			ref={ref}
			onScroll={onScroll}
			className="flex-1 overflow-y-auto flex flex-col max-h-[400px] scrollbar"
		>
			{showLoadMore && (
				<div className="flex justify-center my-4">
					<Button
						className="flex items-center gap-2 px-4 py-2 text-textPrimary font-bold text-[13px] leading-6 tracking-[-0.01em] rounded-lg bg-transparent border-2 border-customGray"
						onPress={onLoadMore}
						disabled={isLoading}
					>
						<span>
							<Loader
								className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
								color="#1A1D1F"
							/>
						</span>
						{isLoading ? "Loading..." : "Load more"}
					</Button>
				</div>
			)}

			{messages.map((msg, index) => (
				<Message
					key={msg.id}
					message={msg}
					isLast={index === messages.length - 1}
				/>
			))}
		</div>
	)
)

MessageList.displayName = "MessageList"
