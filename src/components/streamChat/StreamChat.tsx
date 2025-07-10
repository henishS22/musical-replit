import React, { useEffect } from "react"

import type { ChannelFilters, ChannelOptions, ChannelSort } from "stream-chat"
import {
	Channel,
	ChannelList,
	Chat,
	MessageInput,
	MessageList,
	Thread,
	useCreateChatClient,
	Window
} from "stream-chat-react"
import { EmojiPicker } from "stream-chat-react/emojis"

import "stream-chat-react/dist/css/v2/index.css"

import { fetchChatToken } from "@/app/api/query"
import data from "@emoji-mart/data"
import { useQuery } from "@tanstack/react-query"
import { init, SearchIndex } from "emoji-mart"

import { useDynamicStore, useUserStore } from "@/stores"

import CustomChannelHeader from "./customChannelHeader"
import CustomChannelPreview from "./customChannelList"
import CustomDateSeparator from "./customDateSeperator"

import "./streamChat.css"

const StreamChatPopup = ({ type }: { type: string }) => {
	const { userData } = useUserStore()
	const { ChatPop } = useDynamicStore()

	const { data: chatToken, isLoading: isTokenLoading } = useQuery({
		queryKey: ["chatToken"],
		queryFn: fetchChatToken
	})

	const sort: ChannelSort = { last_message_at: -1 }

	const filters: ChannelFilters = {
		type: type,
		members: { $in: [userData?._id as string] }
	}

	const options: ChannelOptions = {
		limit: 10,
		presence: true
	}

	init({ data })

	const client = useCreateChatClient({
		apiKey: process.env.NEXT_PUBLIC_KEY_GETSTREAM as string,
		tokenOrProvider: chatToken,
		userData: {
			id: userData?._id as string,
			name: userData?.username as string,
			image: userData?.profile_img as string
		}
	})
	useEffect(() => {
		setTimeout(() => {
			const elem = document.getElementsByClassName("rta__textarea")[0]
			if (elem) {
				elem.classList.add(
					"whitespace-nowrap",
					"overflow-x-auto",
					"resize-none",
					"focus:outline-none",
					"focus:ring",
					"focus:ring-blue-500"
				)
			}
		}, 2000)
	}, [])

	if (isTokenLoading || !client) {
		return (
			<div className="flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 h-[590px] w-full">
				<div className="space-y-4 text-center">
					<div className="animate-pulse inline-block p-4 rounded-full bg-primary/10">
						<svg
							className="w-12 h-12 text-primary"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
							/>
						</svg>
					</div>
					<p className="text-lg font-medium animate-pulse">
						{isTokenLoading ? "Loading chat token..." : "Connecting to chat..."}
					</p>
				</div>
			</div>
		)
	}

	return (
		<Chat client={client} theme="str-chat__theme-custom">
			<ChannelList
				filters={filters}
				sort={sort}
				options={options}
				Preview={CustomChannelPreview}
				showChannelSearch
				customActiveChannel={ChatPop?.id || null}
			/>
			<Channel
				EmojiPicker={EmojiPicker}
				emojiSearchIndex={SearchIndex}
				DateSeparator={CustomDateSeparator}
			>
				<Window>
					<CustomChannelHeader />
					<MessageList messageActions={["edit", "delete", "react", "reply"]} />
					<MessageInput />
				</Window>
				<Thread />
			</Channel>
		</Chat>
	)
}

export default StreamChatPopup
