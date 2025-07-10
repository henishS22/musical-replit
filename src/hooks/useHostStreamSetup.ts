import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useParams } from "next/navigation"

import { getStreamToken } from "@/app/api/mutation"
import {
	fetchChatToken,
	fetchStreamDetails,
	fetchStreamNftHolders
} from "@/app/api/query"
import { Call, StreamVideoClient } from "@stream-io/video-react-sdk"
import { useMutation, useQuery } from "@tanstack/react-query"
import { StreamChat, Channel as StreamChatChannel } from "stream-chat"

import useUserStore from "@/stores/user"

/**
 * Hook to handle the initial setup of a host's stream
 * Manages stream client initialization, token fetching, stream type setup, and chat integration
 *
 * @returns {Object} Stream setup state, client/call instances, chat client, and chat channel
 */
export const useHostStreamSetup = () => {
	const { userData } = useUserStore()
	const { id } = useParams()
	const [client, setClient] = useState<StreamVideoClient | null>(null)
	const [call, setCall] = useState<Call | undefined>(undefined)
	const [streamType, setStreamType] = useState<"livestream" | "audio_room">()
	const [chatClient, setChatClient] = useState<StreamChat | null>(null)
	const [chatChannel, setChatChannel] = useState<StreamChatChannel | null>(null)

	// Fetch stream details for the current stream
	const { data: streamDetails, isLoading: isStreamDetailsLoading } = useQuery({
		queryKey: ["streamDetails", id],
		queryFn: () => fetchStreamDetails(id as string)
	})

	// Fetch stream nft holders for the current stream
	const { data: streamNftHolders, isLoading: isStreamNftHoldersLoading } =
		useQuery({
			queryKey: ["streamNftHolders", id],
			queryFn: () => fetchStreamNftHolders(id as string),
			enabled: streamDetails?.accessControl === "private"
		})

	// Fetch chat token
	const { data: chatToken, isLoading: chatTokenLoading } = useQuery({
		queryKey: ["chatToken"],
		queryFn: fetchChatToken
	})

	// Get stream token and initialize stream on success
	const { mutateAsync: fetchStreamToken, isPending: isTokenLoading } =
		useMutation({
			mutationFn: getStreamToken,
			onSuccess: (token) => {
				if (token) {
					initStream(token)
				}
			}
		})

	/**
	 * Initialize the stream with the provided token
	 * Sets up StreamVideoClient and creates/joins the call
	 */
	const initStream = async (token: string) => {
		if (!userData?._id || !id || !token || !streamDetails) {
			return toast.error("Something went wrong")
		}

		try {
			// Initialize Stream client with user details
			const streamClient = new StreamVideoClient({
				apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
				user: {
					id: userData?._id,
					name: userData?.name,
					image: userData?.profile_img as string
				},
				token
			})

			// Create call instance based on stream type
			const streamCall = streamClient.call(
				streamDetails?.type === "video_room" ? "livestream" : "audio_room",
				id as string
			)

			// Handle private stream setup
			if (streamDetails?.accessControl === "private") {
				const nftHolderIds = Array.isArray(streamNftHolders)
					? streamNftHolders
					: []

				const members = nftHolderIds.map((id: string) => ({
					user_id: id,
					role: "user"
				}))

				// Add the admin user if not already in the NFT holders
				if (!nftHolderIds.includes(userData?._id)) {
					members.push({ user_id: userData?._id, role: "host" })
				}

				await streamCall.getOrCreate({
					data: {
						members
					}
				})
			}
			await streamCall.join({ create: true })

			setClient(streamClient)
			setCall(streamCall)
		} catch (error) {
			console.error("Failed to initialize stream:", error)
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
	}, [chatClient, call])

	const isLoading =
		isStreamDetailsLoading ||
		isStreamNftHoldersLoading ||
		isTokenLoading ||
		chatTokenLoading ||
		!client ||
		!chatClient ||
		!call ||
		!chatChannel

	// Initialize stream when user data is available
	useEffect(() => {
		if (userData?._id) {
			fetchStreamToken()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userData?._id])

	// Update stream type when stream details change
	useEffect(() => {
		if (streamDetails) {
			setStreamType(
				streamDetails?.type === "video_room" ? "livestream" : "audio_room"
			)
		}
	}, [streamDetails])

	return {
		client,
		call,
		streamType,
		isLoading,
		chatClient,
		chatChannel,
		streamDetails
	}
}
