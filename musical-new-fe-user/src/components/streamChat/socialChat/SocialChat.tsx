import { useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { ayrshareSocialLink, sendMessage } from "@/app/api/mutation"
import { fetchMessages } from "@/app/api/query"
import { FACEBOOK_ICON, INSTAGRAM_ICON, TWITTER_ICON } from "@/assets"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { SendHorizontal } from "lucide-react"

import { useUserStore } from "@/stores"

// Message Item Component remains the same
interface MessageItemProps {
	name: string
	message?: string
	time?: string
	isActive: boolean
	onClick: () => void
	image: string
}

interface Conversation {
	id: string
	name: string
	lastMessage: string
	lastMessageTime: string
	participant: {
		name: string
		picture?: string
	}
}

interface Message {
	id?: string
	message: string
	action: "sent" | "received"
	created: string
	senderId?: string
	recipientId: string
	senderDetails?: {
		name: string
		profileImage?: string
	}
}

function MessageItem({
	name,
	message,
	time,
	isActive,
	onClick,
	image
}: MessageItemProps) {
	return (
		<div
			className={`p-4 hover:bg-gray-50 cursor-pointer ${isActive ? "bg-blue-50" : ""}`}
			onClick={onClick}
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Image
						src={image}
						className="w-10 h-10 rounded-full"
						alt="profile"
						width={40}
						height={40}
					/>
					<div>
						<h3 className="font-medium">{name}</h3>
						<p className="text-sm text-gray-500">{message}</p>
					</div>
				</div>
				<span className="text-xs text-gray-500">{time}</span>
			</div>
		</div>
	)
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

function formatMessageTime(dateString: string) {
	return new Date(dateString).toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "numeric",
		hour12: true
	})
}

function shouldShowDateDivider(
	currentMessage: Message,
	previousMessage?: Message,
	shownDates?: Set<string>
) {
	if (!previousMessage) return true

	const currentDate = new Date(currentMessage.created).toDateString()
	const previousDate = new Date(previousMessage.created).toDateString()

	// Only show divider if date changes and we haven't shown it yet
	if (currentDate !== previousDate && !shownDates?.has(currentDate)) {
		shownDates?.add(currentDate)
		return true
	}
	return false
}

function ConversationSkeleton() {
	return (
		<>
			{[1, 2, 3, 4, 5].map((i) => (
				<div key={i} className="p-4 animate-pulse">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-gray-200 rounded-full"></div>
							<div>
								<div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
								<div className="h-3 w-24 bg-gray-200 rounded"></div>
							</div>
						</div>
						<div className="h-3 w-12 bg-gray-200 rounded"></div>
					</div>
				</div>
			))}
		</>
	)
}

function MessageSkeleton() {
	return (
		<>
			{[1, 2, 3, 4, 5].map((i) => (
				<div
					key={i}
					className={`mb-4 flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
				>
					<div className="max-w-[70%] animate-pulse">
						{i % 2 !== 0 && (
							<div className="flex items-center gap-2 mb-2 ml-1">
								<div className="w-8 h-8 bg-gray-200 rounded-full"></div>
								<div className="h-4 w-24 bg-gray-200 rounded"></div>
							</div>
						)}
						<div
							className={`${i % 2 === 0 ? "bg-gray-200" : "bg-gray-100"} rounded-lg p-3`}
						>
							<div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
							<div className="h-3 w-16 bg-gray-200 rounded ml-auto"></div>
						</div>
					</div>
				</div>
			))}
		</>
	)
}

export default function SocialChat() {
	const [platform, setPlatform] = useState<string>("x")
	const [url, setUrl] = useState<string>("")
	const [selectedConversationId, setSelectedConversationId] =
		useState<string>("")

	const { subscriptionFeatures } = useUserStore()
	const router = useRouter()

	const [messageText, setMessageText] = useState<string>("")
	const {
		data: conversations,
		isLoading: isLoadingConversations,
		isError: isConversationsError
	} = useQuery({
		queryKey: ["conversations", platform],
		queryFn: () => fetchMessages(platform, "conversationsOnly=true"),
		enabled: !!platform && !!subscriptionFeatures?.[8]?.available
	})

	const {
		data: messages,
		isLoading: isLoadingMessages
		// isError: isMessagesError
	} = useQuery({
		queryKey: ["messages", platform, selectedConversationId],
		queryFn: () =>
			fetchMessages(platform, `conversationId=${selectedConversationId}`),
		enabled: !!selectedConversationId
	})

	const { mutate } = useMutation({
		mutationFn: () => ayrshareSocialLink(),
		onSuccess: (data) => {
			if (data?.url && url.length === 0) {
				setUrl(data.url)
			}
		},
		onError: (error: Error) => {
			toast.error("Social link generation failed" + error.message)
		}
	})

	const queryClient = useQueryClient()

	useEffect(() => {
		if (conversations?.status === "error") {
			mutate()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [conversations])

	const { mutate: sendSocialMessage } = useMutation({
		mutationFn: (payload: Record<string, string>) =>
			sendMessage(payload, platform),
		onError: (error: Error) => {
			toast.error("failed" + error.message)
		}
	})

	// Add state for local messages
	const [localMessages, setLocalMessages] = useState<Message[]>([])

	// Update local messages when query data changes
	useEffect(() => {
		if (messages?.messages) {
			setLocalMessages(messages.messages)
		}
	}, [messages])

	// Modify your send message handler
	const handleSendMessage = async () => {
		try {
			const recipientId =
				localMessages[0]?.action === "received"
					? localMessages[0].senderId
					: localMessages[0].recipientId
			// Add message to local state immediately
			const newMessage: Message = {
				message: messageText,
				action: "sent",
				created: new Date().toISOString(),
				recipientId: recipientId || ""
				// Add other required message properties here
			}

			setLocalMessages((prev) => [newMessage, ...prev])

			// Clear input
			setMessageText("")

			// Make API call
			const payload = {
				recipientId: recipientId || "",
				message: messageText
			}
			sendSocialMessage(payload)

			// Invalidate query to get fresh data
			queryClient.invalidateQueries({
				queryKey: ["messages", platform, selectedConversationId]
			})
		} catch (error) {
			console.error("Failed to send message:", error)
		}
	}

	// Add ref for the messages container
	const messagesEndRef = useRef<HTMLDivElement>(null)

	// Scroll to bottom function
	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
	}

	// Use effect to scroll on new messages
	useEffect(() => {
		scrollToBottom()
	}, [localMessages])

	// Handle enter key press
	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !e.shiftKey && messageText.trim()) {
			e.preventDefault()
			handleSendMessage()
		}
	}

	if (!subscriptionFeatures?.[8]?.available)
		return (
			<div className="flex h-full w-full items-center justify-center">
				<div className="text-center p-8 bg-white max-w-md">
					<h2 className="text-2xl font-semibold text-gray-800 mb-4">
						Upgrade Your Plan
					</h2>
					<p className="text-center text-sm text-gray-500 mb-4 flex flex-col gap-2 items-center justify-center">
						To access social media messaging features, please upgrade your
						subscription plan.
					</p>
					<button
						onClick={() => router.push("/subscription")}
						className="h-10 px-2 text-sm text-black font-semibold bg-[#FCFCFC] border-2 border-customGray hover:bg-gray-100 rounded-lg py-2.5 me-2 mb-2"
					>
						Upgrade Now
					</button>
				</div>
			</div>
		)

	return (
		<div className="flex h-full w-full">
			{/* Left side - Message list */}
			<div className="w-1/3 border-r border-gray-200">
				<div className="p-4 border-b border-gray-200">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold truncate mr-2">
							{platform.charAt(0).toUpperCase() + platform.slice(1)} Messages
						</h2>
						<div className="flex gap-2 shrink-0">
							<Image
								src={TWITTER_ICON}
								className={`w-5 h-5 cursor-pointer ${
									platform === "x" ? "opacity-100" : "opacity-50"
								}`}
								onClick={() => setPlatform("x")}
								alt="twitter"
								width={20}
								height={20}
							/>

							<Image
								src={FACEBOOK_ICON}
								className={`w-5 h-5 cursor-pointer ${
									platform === "facebook" ? "opacity-100" : "opacity-50"
								}`}
								onClick={() => setPlatform("facebook")}
								alt="facebook"
								width={20}
								height={20}
							/>
							<Image
								src={INSTAGRAM_ICON}
								className={`w-5 h-5 cursor-pointer ${
									platform === "instagram" ? "opacity-100" : "opacity-50"
								}`}
								onClick={() => setPlatform("instagram")}
								alt="instagram"
								width={20}
								height={20}
							/>
						</div>
					</div>
				</div>

				<div className="overflow-y-auto h-[calc(100%-60px)]">
					{isLoadingConversations ? (
						<ConversationSkeleton />
					) : (
						conversations?.converstationsDetails?.map(
							(conversation: Conversation) => (
								<MessageItem
									key={conversation.id}
									name={conversation.participant.name}
									message={conversation.lastMessage}
									time={conversation.lastMessageTime}
									isActive={selectedConversationId === conversation.id}
									onClick={() => setSelectedConversationId(conversation.id)}
									image={conversation.participant.picture || ""}
								/>
							)
						)
					)}
				</div>
			</div>

			{/* Right side - Chat window */}
			<div className="w-2/3 flex flex-col">
				<div className="p-4 border-b border-gray-200">
					<h2 className="text-lg font-semibold">
						{selectedConversationId ? "Chat Messages" : "Select a conversation"}
					</h2>
				</div>

				<div className="h-[460px] overflow-y-auto p-4 messages-container">
					{isConversationsError || conversations?.status === "error" ? (
						<div className="h-full flex items-center justify-center">
							<a
								href={url}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-500 underline hover:text-blue-700 cursor-pointer"
							>
								Please link your social account
							</a>
						</div>
					) : isLoadingMessages ? (
						<MessageSkeleton />
					) : (
						(() => {
							const shownDates = new Set<string>()
							return (
								localMessages?.length > 0 &&
								localMessages
									.slice()
									.reverse()
									.map((message: Message, index: number) => (
										<div key={message.id}>
											{shouldShowDateDivider(
												message,
												localMessages[index - 1],
												shownDates
											) && (
												<div className="flex items-center justify-center my-4">
													<div className="bg-gray-200 h-[1px] flex-1" />
													<span className="px-4 text-sm text-gray-500">
														{formatMessageDate(message.created)}
													</span>
													<div className="bg-gray-200 h-[1px] flex-1" />
												</div>
											)}
											<div
												className={`mb-4 flex ${message.action === "sent" ? "justify-end" : "justify-start"}`}
											>
												<div className="max-w-[70%]">
													{message.action === "received" &&
														message.senderDetails && (
															<div className="flex items-center gap-2 mb-2 ml-1">
																<div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
																	{message.senderDetails.profileImage && (
																		<Image
																			src={message.senderDetails.profileImage}
																			alt={message.senderDetails.name}
																			width={32}
																			height={32}
																			className="w-full h-full object-cover"
																		/>
																	)}
																</div>
																<span className="text-sm font-medium text-gray-700">
																	{message.senderDetails.name}
																</span>
															</div>
														)}
													<div
														className={`${message.action === "sent" ? "bg-blue-500 text-white" : "bg-gray-100"} rounded-lg p-3`}
													>
														<div
															className={`${message.action === "received" ? "text-gray-800" : "text-white"}`}
														>
															{message.message}
														</div>
														<div
															className={`text-xs mt-1 ${message.action === "sent" ? "text-white/80" : "text-gray-500"} text-right`}
														>
															{formatMessageTime(message.created)}
														</div>
													</div>
												</div>
											</div>
										</div>
									))
							)
						})()
					)}
					{/* Add this div at the bottom of your messages container */}
					<div ref={messagesEndRef} />
				</div>

				{/* Message input */}
				<div className="p-4 border-t border-gray-200">
					<div className="flex items-center gap-2">
						{/* <button className="p-2 hover:bg-gray-100 rounded-full">
							<Plus className="w-5 h-5 text-gray-700" />
						</button> */}
						<input
							type="text"
							placeholder="Type your message..."
							className="flex-1 p-2 border border-gray-200 rounded-lg"
							value={messageText}
							onChange={(e) => setMessageText(e.target.value)}
							onKeyDown={handleKeyPress}
						/>
						{/* <button className="p-2 hover:bg-gray-100 rounded-full">
							<Smile className="w-5 h-5 text-gray-700" />
						</button> */}
						<button
							className="p-2 hover:bg-gray-100 rounded-full"
							onClick={handleSendMessage}
						>
							<SendHorizontal className="w-5 h-5 text-gray-700" />
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
