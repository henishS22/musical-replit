"use client"

import { FC, useEffect } from "react"

import {
	StreamCall,
	StreamTheme,
	StreamVideo,
	StreamVideoClient
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

import { useHostPermissions } from "@/hooks/useHostPermissions"
import { useHostStreamControls } from "@/hooks/useHostStreamControls"
import { useHostStreamSetup } from "@/hooks/useHostStreamSetup"

import StreamSkeleton from "../skeletons/StreamSkeleton"
import StreamCallContent from "./StreamCallContent"
// Import necessary styles
import "stream-chat-react/dist/css/v2/index.css"

import { StreamChat } from "stream-chat"

const HostStream: FC = () => {
	const {
		client: videoClient,
		call,
		streamType,
		isLoading,
		chatChannel,
		chatClient
	} = useHostStreamSetup()

	const { isLive, handleGoLive, handleEndStream } = useHostStreamControls(call)

	const { permissionRequests, handlePermissionRequest } =
		useHostPermissions(call)

	// Use useEffect to handle component unmount
	useEffect(() => {
		return () => {
			if (isLive) {
				handleEndStream()
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLive])

	if (isLoading) {
		return <StreamSkeleton type={streamType as "livestream" | "audio_room"} />
	}

	return (
		<div className="flex xl:flex-row gap-4 xl:gap-0 flex-col w-full">
			<div
				className={`${streamType === "livestream" ? "w-full xl:w-3/4" : "w-full"}`}
			>
				<StreamVideo client={videoClient as StreamVideoClient}>
					<StreamTheme>
						<StreamCall call={call}>
							<StreamCallContent
								streamType={streamType as string}
								isLive={isLive}
								handleGoLive={handleGoLive}
								handleEndStream={handleEndStream}
								permissionRequests={permissionRequests}
								handlePermissionRequest={handlePermissionRequest}
							/>
						</StreamCall>
					</StreamTheme>
				</StreamVideo>
			</div>

			{chatChannel && chatClient && streamType === "livestream" && (
				<div className="w-full xl:w-1/4 border-l  xl:max-h-[826px] max-h-[350px] bg-white rounded-xl shadow-lg p-6 threadOpen">
					<Chat
						client={chatClient as StreamChat}
						theme="str-chat__theme-custom"
						customClasses={{
							threadList: "!h-full"
						}}
					>
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

export default HostStream
