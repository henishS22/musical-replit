"use client"

import { FC, useCallback, useEffect } from "react"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"

import {
	OwnCapability,
	StreamCall,
	StreamTheme,
	StreamVideo,
	StreamVideoClient,
	StreamVideoEvent
} from "@stream-io/video-react-sdk"
import {
	Channel,
	ChannelHeader,
	Chat,
	MessageInput,
	MessageList,
	Thread,
	Window
} from "stream-chat-react"

import "stream-chat-react/dist/css/v2/index.css"

import { useViewerStreamSetup } from "@/hooks/useViewerStreamSetup"

import StreamSkeleton from "../skeletons/StreamSkeleton"
import ViewStreamContent from "./ViewStreamContent"

const ViewStream: FC = () => {
	const router = useRouter()
	const { client, call, streamType, isLoading, chatClient, chatChannel } =
		useViewerStreamSetup()

	// Request permission to send audio
	const handleRequestPermission = useCallback(async () => {
		try {
			await call?.requestPermissions({
				permissions: [OwnCapability.SEND_AUDIO]
			})
		} catch (error) {
			console.error("Failed to request permission:", error)
		}
	}, [call])

	// Call ended listener
	useEffect(() => {
		if (!client) return

		const unsubscribe = client.on("call.ended", (event: StreamVideoEvent) => {
			if (event.type === "call.ended") {
				toast.error("Live stream ended by host")
				router.push("/")
			}
		})

		return () => {
			unsubscribe?.() // Clean up the event listener when component unmounts
		}
	}, [client, router])

	// Render loading skeleton or stream components
	if (isLoading || !call) {
		return <StreamSkeleton type={streamType as "livestream" | "audio_room"} />
	}

	return (
		<div className="flex xl:flex-row flex-col xl:gap-0 gap-4">
			<div
				className={`${streamType === "livestream" ? "w-full xl:w-3/4" : "w-full"}`}
			>
				<StreamVideo client={client as StreamVideoClient}>
					<StreamTheme>
						<StreamCall call={call}>
							<ViewStreamContent
								streamType={streamType as string}
								handleRequestPermission={handleRequestPermission}
								handleLeaveCall={() => router.push("/")}
							/>
						</StreamCall>
					</StreamTheme>
				</StreamVideo>
			</div>

			{chatChannel && chatClient && streamType === "livestream" && (
				<div className="w-full xl:w-1/4 border-l xl:max-h-[822px] max-h-[350px] bg-white rounded-xl shadow-lg p-6 liveChat threadOpen">
					<Chat client={chatClient} theme="str-chat__theme-custom">
						<Channel channel={chatChannel}>
							<Window>
								<ChannelHeader />
								<MessageList
									messageActions={["edit", "delete", "react", "reply"]}
								/>
								<MessageInput />
							</Window>
							<Thread />
						</Channel>
					</Chat>
				</div>
			)}
		</div>
	)
}

export default ViewStream
