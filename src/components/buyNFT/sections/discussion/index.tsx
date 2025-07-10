"use client"

import { useEffect, useState } from "react"

import { fetchChatToken } from "@/app/api/query"
import { NoDataFound } from "@/components/ui"
import { Skeleton } from "@/components/ui/skeleton"
import { ChatMessage } from "@/types/chat"
import { Button } from "@nextui-org/react"
import { useQuery } from "@tanstack/react-query"
import { StreamChat } from "stream-chat"

import { useDynamicStore, useUserStore } from "@/stores"

import LockedCard from "../LockedCard"
import { Message } from "./Message"

export function Discussion({
	projectId,
	signature
}: {
	projectId: string
	signature: string
}) {
	const [client, setClient] = useState<StreamChat | null>(null)
	const { user } = useUserStore()
	const { addState } = useDynamicStore()
	const [messages, setMessages] = useState<ChatMessage[]>([])
	const [isLoading, setIsLoading] = useState(true)

	const { data: chatToken } = useQuery({
		queryKey: ["chatToken"],
		queryFn: fetchChatToken
	})

	const fetchChannel = async () => {
		if (!client || !projectId || !chatToken) return
		try {
			setIsLoading(true)
			const channels = await client.queryChannels({ id: projectId as string })
			if (channels.length > 0) {
				const result = await channels[0].query({
					messages: { limit: 100 }
				})

				const messages = result?.messages.map((message) => ({
					id: message.id,
					text: message.text as string,
					user: {
						id: message.user?.id as string,
						name: message.user?.name as string,
						image: message.user?.image as string
					},
					cid: message.cid as string,
					created_at: message.created_at as string,
					updated_at: message.updated_at as string
				}))

				setMessages(messages)
			}
		} catch (error) {
			console.error("error", error)
		} finally {
			setIsLoading(false)
		}
	}

	const subscribeChat = async () => {
		if (!client || !chatToken) return
		await client.connectUser(
			{
				id: user?.id as string
			},
			chatToken
		)
		fetchChannel()
	}

	const handleExpandChat = () => {
		addState("ChatPop", {
			open: true,
			id: projectId as string
		})
	}

	useEffect(() => {
		subscribeChat()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [client, user, chatToken])

	useEffect(() => {
		const chatClient = StreamChat.getInstance(
			process.env.NEXT_PUBLIC_KEY_GETSTREAM || ""
		)
		setClient(chatClient)
	}, [])

	return (
		<div className="p-4">
			{signature?.length > 0 ? (
				<div className="flex flex-col gap-6">
					<div className="flex flex-col">
						<div className="flex items-center gap-4">
							<div className="flex shrink-0 self-stretch my-auto w-4 h-8 bg-[#FFBC99] rounded" />
							<h2 className="font-semibold text-[20px] leading-[32px]">Chat</h2>
						</div>
						{isLoading ? (
							<div className="flex flex-col gap-4 mt-4">
								{[...Array(3)].map((_, index) => (
									<div key={index} className="flex gap-3">
										<Skeleton className="w-8 h-8 rounded-full" />
										<div className="flex flex-col gap-2 flex-1">
											<Skeleton className="h-4 w-24 rounded-lg" />
											<Skeleton className="h-16 w-full rounded-lg" />
										</div>
									</div>
								))}
							</div>
						) : messages.length > 0 ? (
							messages.map((msg, index) => (
								<Message
									key={msg.id}
									message={msg}
									isLast={index === messages.length - 1}
								/>
							))
						) : (
							<div className="flex flex-col items-center justify-center py-8">
								<NoDataFound message="No messages yet" />
							</div>
						)}
					</div>
					<div className="flex justify-center">
						<Button
							className="font-bold rounded-md px-5 py-3 text-[15px] shadow transition-colors bg-btnColor hover:bg-btnColorHover text-white"
							onPress={handleExpandChat}
						>
							Go to Chat
						</Button>
					</div>
				</div>
			) : (
				<LockedCard label="Chat" type="Discussion" />
			)}
		</div>
	)
}
