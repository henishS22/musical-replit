import { BUILD_COMMUNITY, COLLABORATE, FAN_TOKENS } from "@/assets"
import {
	BUILD_COMMUNITY_MODAL,
	COLLABORATE_MODAL,
	COMING_SOON_MODAL,
	ENGAGE_SOCIAL_MEDIA_MODAL,
	FAN_TOKENS_MODAL,
	INVITE_COLLABORATOR_MODAL
} from "@/constant/modalType"

export const engageOptions = [
	{
		title: "Collaborate",
		icon: COLLABORATE,
		options: [
			{
				title: "Collaborate with Artists:",
				value: "collab_artists",
				type: COLLABORATE_MODAL,
				description: "Find other creators to work on new projects with"
			},
			{
				title: "Post a Collab Opp:",
				value: "collab_opp",
				type: INVITE_COLLABORATOR_MODAL,
				description: "Post an idea or track and see who is down to tap in"
			},
			{
				title: "Collaborate with Fans:",
				value: "fan_contest",
				type: INVITE_COLLABORATOR_MODAL,
				description: "Leverage your biggest supporters to make new music"
			}
		]
	},
	{
		title: "Mint Fan Tokens",
		icon: FAN_TOKENS,
		options: [
			{
				title: "Pay Gate Content:",
				value: "pay_gate",
				type: FAN_TOKENS_MODAL,
				description: "Create content only accessible to token holders"
			},
			{
				title: "Crowdfund a Project:",
				value: "crowdfund_project",
				type: FAN_TOKENS_MODAL,
				description: "Sell tokens to fund recording, touring, merch, etc."
			},
			{
				title: "Issue a Collectible:",
				value: "issue_collectible",
				type: FAN_TOKENS_MODAL,
				description:
					"Make limited edition digital collectibles for your best fans"
			}
		]
	},
	{
		title: "Build Community",
		icon: BUILD_COMMUNITY,
		options: [
			{
				title: "Social Media:",
				value: "social_media",
				type: ENGAGE_SOCIAL_MEDIA_MODAL,
				description:
					"Post to social media with AI creative tools across platforms"
			},
			{
				title: "Start a Livestream:",
				value: "livestream",
				type: BUILD_COMMUNITY_MODAL,
				description: "Start a livestream for anyone, or just token holders"
			},
			{
				title: "Fan Quests:",
				value: "fan_quests",
				type: COMING_SOON_MODAL,
				description: "Set up tasks fans can complete to earn rewards and prizes"
			}
		]
	}
]
