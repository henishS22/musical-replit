import { useEffect, useRef } from "react"
import Image from "next/image"

import { CHAT_BOT_ICON } from "@/assets"
import { InputSection } from "@/components/ui/inputSection/InputSection"
import { parseMarkdown } from "@/helpers"

import { useAIChatStore } from "@/stores"

interface ChatDisplayProps {
	onSendMessage: (text: string) => void
	isPending: boolean
}

export const ChatDisplay = ({ onSendMessage, isPending }: ChatDisplayProps) => {
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const { lyrics: messages } = useAIChatStore()

	const handleSendMessage = (text: string) => {
		if (text.trim()) {
			onSendMessage(text)
		}
	}

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
	}

	useEffect(() => {
		scrollToBottom()
	}, [messages])

	return (
		<div className="w-full p-6">
			{/* Chat Messages */}
			<div className="flex-1 grey-scrollbar min-h-[500px] max-h-[500px] p-4 overflow-y-auto flex flex-col gap-[40px]">
				{messages.map((msg, index) => (
					<div
						key={index}
						className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
					>
						{msg.type !== "user" && (
							<div className="w-8 h-8 rounded-full bg-[#E8FAF0] flex items-center justify-center mr-2">
								<Image
									src={CHAT_BOT_ICON}
									alt="chatbot-icon"
									width={14}
									height={14}
								/>
							</div>
						)}
						<div
							className={`max-w-[70%] rounded-2xl ${
								msg.type === "user" ? "bg-[#F1F1F1] px-4 py-2" : ""
							}`}
						>
							<p
								className={`font-semibold text-[16px] leading-6 tracking-normal text-[#0A1629]}`}
							>
								{msg.type === "bot" ? parseMarkdown(msg.content) : msg.content}
							</p>
						</div>
					</div>
				))}
				<div ref={messagesEndRef} />
			</div>

			{/* Input Section */}
			<div className="">
				<InputSection
					isDisabled={isPending}
					placeholder="Write a rap with a motivational theme"
					inputIcon={{
						type: "mic"
					}}
					onComplete={(file, type, text) => {
						handleSendMessage(text)
					}}
				/>
			</div>
		</div>
	)
}
