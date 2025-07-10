import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useParams, useRouter } from "next/navigation"

import { getStreamToken } from "@/app/api/mutation"
import { fetchChatToken, fetchStreamDetails } from "@/app/api/query"
import { Call, StreamVideoClient } from "@stream-io/video-react-sdk"
import { useMutation, useQuery } from "@tanstack/react-query"
import { StreamChat, Channel as StreamChatChannel } from "stream-chat"

import useUserStore from "@/stores/user"

/**
 * Custom hook for setting up and managing viewer stream functionality
 * Handles stream client initialization, call setup, stream type management, and chat integration
 * @returns {Object} Stream setup data including client, call, streamType, chatClient, chatChannel, and loading state
 */
export const useViewerStreamSetup = () => {
	// Access user data from global store
	const { userData } = useUserStore()
	const { id } = useParams()
	const router = useRouter()

	// Initialize state for stream components
	const [client, setClient] = useState<StreamVideoClient | null>(null)
	const [call, setCall] = useState<Call | null>(null)
	const [streamType, setStreamType] = useState<"livestream" | "audio_room">()
	const [chatClient, setChatClient] = useState<StreamChat | null>(null)
	const [chatChannel, setChatChannel] = useState<StreamChatChannel | null>(null)

	/**
	 * Fetch stream details using React Query
	 * This query retrieves information about the current stream
	 */
	const { data: streamDetails } = useQuery({
		queryKey: ["streamDetails", id],
		queryFn: () => fetchStreamDetails(id as string)
	})

	// Fetch chat token
	const { data: chatToken, isLoading: chatTokenLoading } = useQuery({
		queryKey: ["chatToken"],
		queryFn: fetchChatToken
	})

	/**
	 * Mutation for fetching stream token
	 * On success, initializes the stream with the received token
	 */
	const { mutateAsync: fetchStreamToken, isPending: isTokenLoading } =
		useMutation({
			mutationFn: getStreamToken,
			onSuccess: (tokenData) => {
				if (tokenData) {
					initStream(tokenData)
				}
			}
		})

	/**
	 * Initialize stream with the provided token
	 * Creates StreamVideoClient and joins the call as a viewer
	 * @param {string} tokenData - Token for stream authentication
	 */
	const initStream = async (tokenData: string) => {
		if (!userData?._id || !id || !streamDetails || !streamType)
			return toast.error("Something went wrong")
		try {
			// Initialize Stream client with user data and token
			const streamClient = new StreamVideoClient({
				apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
				user: {
					id: userData?._id,
					name: userData?.name || "Anonymous",
					image: userData?.profile_img || ""
				},
				token: tokenData
			})

			// Create call instance and join as viewer
			const streamCall = streamClient.call(streamType as string, id as string)
			await streamCall.join({
				create: false
			})

			// Update state with initialized client and call
			setClient(streamClient)
			setCall(streamCall)
		} catch (error) {
			console.error("Failed to join stream:", error)
			router.push("/")
		}
	}

	// Chat client setup
	useEffect(() => {
		if (chatToken && userData?._id) {
			const initializeChatClient = async () => {
				try {
					const client = new StreamChat(
						process.env.NEXT_PUBLIC_KEY_GETSTREAM as string
					)

					await client.connectUser(
						{
							id: userData?._id as string,
							name: userData?.username as string,
							image: userData?.profile_img as string
						},
						chatToken
					)

					setChatClient(client)
				} catch (error) {
					console.error("Error initializing chat client:", error)
				}
			}

			initializeChatClient()
		}
	}, [chatToken, userData])

	// Create a channel for the livestream
	useEffect(() => {
		const setupChatChannel = async () => {
			if (chatClient && call) {
				try {
					const channel = chatClient.channel("livestream", call.id, {
						name: streamDetails?.title || `Livestream`
					})
					await channel.watch()
					setChatChannel(channel)
				} catch (error) {
					console.error("Error setting up chat channel:", error)
				}
			}
		}

		setupChatChannel()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chatClient, call, streamDetails])

	/**
	 * Effect to fetch stream token when user data is available
	 * Includes cleanup function to handle stream disconnection
	 */
	useEffect(() => {
		if (userData?._id) {
			fetchStreamToken()
		}

		// Cleanup: Leave call and disconnect client
		return () => {
			call?.leave()
			client?.disconnectUser()
			chatClient?.disconnectUser()
			chatChannel?.stopWatching()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userData?._id])

	/**
	 * Effect to set stream type based on stream details
	 * Determines whether the stream is a video livestream or audio room
	 */
	useEffect(() => {
		if (streamDetails) {
			setStreamType(
				streamDetails?.type === "video_room" ? "livestream" : "audio_room"
			)
		}
	}, [streamDetails])

	const isLoading =
		isTokenLoading ||
		chatTokenLoading ||
		!client ||
		!chatClient ||
		!call ||
		!chatChannel

	return {
		client,
		call,
		streamType,
		isLoading,
		chatClient,
		chatChannel
	}
}
