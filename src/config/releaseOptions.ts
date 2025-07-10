import { PRE_RELEASE, REGISTER, STREAMING } from "@/assets"
import {
	COMING_SOON_MODAL,
	PRE_RELEASE_MODAL,
	REGISTER_IP_MODAL,
	STREAMING_MODAL
} from "@/constant/modalType"

export const releaseOptions = [
	{
		title: "Register IP",
		icon: REGISTER,
		options: [
			{
				title: "Add IP Metadata:",
				value: "metadata",
				type: REGISTER_IP_MODAL,
				description: "Put the release info and metadata together"
			},
			{
				title: "Fulfill Web2 Standards:",
				value: "web2",
				type: REGISTER_IP_MODAL,
				description: "Register with PRO's and DDEX"
			},
			{
				title: "Ping Web3 Protocol:",
				value: "web3",
				type: REGISTER_IP_MODAL,
				description: "Put your IP on the blockchain"
			}
		]
	},
	{
		title: "Pre Release Music",
		icon: PRE_RELEASE,
		options: [
			{
				title: "Create a Landing Page:",
				value: "landing",
				type: COMING_SOON_MODAL,
				description: "Publish a page specifically for the release"
			},
			{
				title: "Generate an Access Token:",
				value: "token",
				type: PRE_RELEASE_MODAL,
				description: "Mint a token for fans to purchase and access now"
			},
			{
				title: "Create a Fan Subscription:",
				value: "subscription",
				type: COMING_SOON_MODAL,
				description: "Start a subscription that gives early intros to music"
			}
		]
	},
	{
		title: "Send to Streaming",
		icon: STREAMING,
		options: [
			{
				title: "Get Approved for Distro:",
				value: "approval",
				type: STREAMING_MODAL,
				description: "We require approval to use Community distribution"
			},
			{
				title: "Release Audio:",
				value: "releaseAudio",
				type: STREAMING_MODAL,
				description: "Store release details and package audio files"
			},
			{
				title: "Release Video:",
				value: "releaseVideo",
				type: STREAMING_MODAL,
				description: "Store video details and publish to social media"
			}
		]
	}
]
