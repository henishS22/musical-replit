// import { BUILD_COMMUNITY, COLLABORATE, MINT_TOKENS } from "@/assets"
import {
	BUILD_COMMUNITY_ENGAGE_ICON,
	COLLABORATE_ENGAGE_ICON,
	MINT_TOKENS_ENGAGE_ICON
} from "@/assets"
import {
	BUILD_COMMUNITY_MODAL,
	COLLABORATE_MODAL
	// MINT_TOKENS_MODAL
} from "@/constant/modalType"

export const engageOptions = [
	{
		title: "Collaborate",
		icon: COLLABORATE_ENGAGE_ICON,
		options: [
			{
				title: "Collaborate with Artists:",
				value: "collaborate_artists",
				type: COLLABORATE_MODAL,
				description: "Find other creators to work on new projects with"
			},
			{
				title: "Post a Collab Opp:",
				value: "post_collab",
				type: COLLABORATE_MODAL,
				description: "Post an idea or track and see who is down to tap in"
			},
			{
				title: "Start a Fan Contest:",
				value: "fan_contest",
				type: COLLABORATE_MODAL,
				description: "Leverage your biggest supporters to make new music"
			}
		]
	},
	{
		title: "Mint Fan Tokens",
		icon: MINT_TOKENS_ENGAGE_ICON,
		options: [
			{
				title: "Pay Gate Content:",
				value: "pay_gate",
				// type: MINT_TOKENS_MODAL,
				description: "Create content only accessible to token holders"
			},
			{
				title: "Crowdfund a Project:",
				value: "crowdfund_project",
				// type: MINT_TOKENS_MODAL,
				description: "Sell tokens to fund recording, touring, merch, etc."
			},
			{
				title: "Issue a Collectible:",
				value: "issue_collectible",
				// type: MINT_TOKENS_MODAL,
				description:
					"Make limited edition digital collectibles for your best fans"
			}
		]
	},
	{
		title: "Build Community",
		icon: BUILD_COMMUNITY_ENGAGE_ICON,
		options: [
			{
				title: "Social Media:",
				value: "social_media",
				type: BUILD_COMMUNITY_MODAL,
				description:
					"Post to social media with AI creative tools across platforms"
			},
			{
				title: "Start a Livestream:",
				value: "start_livestream",
				type: BUILD_COMMUNITY_MODAL,
				description: "Start a livestream for anyone, or just token holders"
			},
			{
				title: "Fan Quests:",
				value: "fan_quests",
				type: BUILD_COMMUNITY_MODAL,
				description: "Set up tasks fans can complete to earn rewards and prizes"
			}
		]
	}
]
