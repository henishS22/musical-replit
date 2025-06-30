import { useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"

import { fetchChatBot } from "@/app/api/query"
import { parseMarkdown } from "@/helpers"
import { useMutation } from "@tanstack/react-query"
import { SendHorizontal, Trash2 } from "lucide-react"

import { useAIChatStore } from "@/stores"

interface Message {
	id: string
	content: string
	type: "user" | "bot"
	timestamp: string
}

function formatMessageTime(dateString: string) {
	return new Date(dateString).toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "numeric",
		hour12: true
	})
}

function formatMessageDate(dateString: string) {
	const messageDate = new Date(dateString)
	const today = new Date()
	const yesterday = new Date(today)
	yesterday.setDate(yesterday.getDate() - 1)

	if (messageDate.toDateString() === today.toDateString()) {
		return "Today"
	} else if (messageDate.toDateString() === yesterday.toDateString()) {
		return "Yesterday"
	} else {
		return messageDate.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric"
		})
	}
}

function shouldShowDateDivider(
	currentMessage: Message,
	previousMessage?: Message,
	shownDates?: Set<string>
) {
	if (!previousMessage) return true

	const currentDate = new Date(currentMessage.timestamp).toDateString()
	const previousDate = new Date(previousMessage.timestamp).toDateString()

	if (currentDate !== previousDate && !shownDates?.has(currentDate)) {
		shownDates?.add(currentDate)
		return true
	}
	return false
}

function TypingIndicator() {
	return (
		<div className="flex items-center gap-2 mb-4">
			<div className="flex items-center gap-1 bg-gray-100 rounded-lg px-4 py-2">
				<span
					className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
					style={{ animationDelay: "0ms" }}
				></span>
				<span
					className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
					style={{ animationDelay: "150ms" }}
				></span>
				<span
					className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
					style={{ animationDelay: "300ms" }}
				></span>
			</div>
		</div>
	)
}

export default function AiChatbot() {
	const [inputMessage, setInputMessage] = useState("")
	const shownDates = new Set<string>()
	const messagesEndRef = useRef<HTMLDivElement>(null)

	// Get messages and addMessage from Zustand store
	const { messages, addMessage, clearMessages } = useAIChatStore()

	const { mutate: sendMessage, isPending } = useMutation({
		mutationFn: (content: string) => fetchChatBot({ content }),
		onSuccess: (response) => {
			const botMessage: Message = {
				id: Date.now().toString() + "-bot",
				content: response || "Sorry, I couldn't process that.",
				type: "bot",
				timestamp: new Date().toISOString()
			}
			// Add to Zustand store instead of local state
			addMessage(botMessage)
		},
		onError: (error: Error) => {
			toast.error("Failed to get response: " + error.message)
		}
	})

	const handleSendMessage = () => {
		if (!inputMessage.trim() || isPending) return

		const userMessage: Message = {
			id: Date.now().toString() + "-user",
			content: inputMessage,
			type: "user",
			timestamp: new Date().toISOString()
		}

		// Add to Zustand store instead of local state
		addMessage(userMessage)
		sendMessage(inputMessage)
		setInputMessage("")
	}

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault()
			handleSendMessage()
		}
	}

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "instant" })
	}

	useEffect(() => {
		scrollToBottom()
	}, [messages, isPending])

	return (
		<div className="flex flex-col h-full w-full bg-white rounded-lg shadow">
			<div
				className={`p-4 ${messages.length > 0 && "border-b"} border-gray-200 flex justify-between items-center`}
			>
				{messages.length > 0 && (
					<button
						onClick={clearMessages}
						className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-red-500"
						title="Clear chat history"
					>
						<Trash2 className="w-5 h-5" />
					</button>
				)}
			</div>
			<div className="flex-1 overflow-y-auto px-4">
				{messages.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full text-gray-500">
						<p className="text-lg">Welcome to Piper AI!</p>
						<p className="text-sm">
							Start a conversation by typing a message below.
						</p>
					</div>
				) : (
					messages.map((message, index) => (
						<div key={message.id}>
							{shouldShowDateDivider(
								message,
								messages[index - 1],
								shownDates
							) && (
								<div className="flex items-center justify-center my-4">
									<div className="bg-gray-200 h-[1px] flex-1" />
									<span className="px-4 text-sm text-gray-500">
										{formatMessageDate(message.timestamp)}
									</span>
									<div className="bg-gray-200 h-[1px] flex-1" />
								</div>
							)}
							<div
								className={`mb-4 flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
							>
								<div className="max-w-[70%]">
									<div
										className={`${
											message.type === "user"
												? "bg-blue-500 text-white"
												: "bg-gray-100"
										} rounded-lg p-3`}
									>
										{message.type === "bot" ? (
											<div className="text-gray-800">
												{parseMarkdown(message.content)}
											</div>
										) : (
											<div className="text-white">{message.content}</div>
										)}
										<div
											className={`text-xs mt-1 ${
												message.type === "user"
													? "text-white/80"
													: "text-gray-500"
											} text-right`}
										>
											{formatMessageTime(message.timestamp)}
										</div>
									</div>
								</div>
							</div>
						</div>
					))
				)}
				{isPending && <TypingIndicator />}
				<div ref={messagesEndRef} />
			</div>

			<div className="p-4 border-t border-gray-200">
				<div className="flex items-center gap-2">
					<input
						type="text"
						value={inputMessage}
						onChange={(e) => setInputMessage(e.target.value)}
						onKeyDown={handleKeyPress}
						placeholder="Type your message..."
						className="flex-1 p-2 border border-gray-200 rounded-lg"
						disabled={isPending}
					/>
					<button
						className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
						onClick={handleSendMessage}
						disabled={isPending || !inputMessage.trim()}
					>
						<SendHorizontal className="w-5 h-5 text-gray-700" />
					</button>
				</div>
			</div>
		</div>
	)
}
