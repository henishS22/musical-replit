import {
	CREATE_MODULE_MODAL,
	ENGAGE_MODAL,
	PROMOTE_MODULE_MODAL,
	RELEASE_MODULE_MODAL
} from "@/constant/modalType"

import {
	CREATE_ICON,
	ENGAGE_ICON,
	PROMOTE_ICON,
	REALEASE_ICON
} from "../assets"

export const overviewData = [
	{
		title: "Create",
		description: "Upload your files, invite collab partners, work with AI",
		icon: CREATE_ICON,
		iconWidth: 22,
		iconHeight: 22,
		actionText: "Let's Go",
		bgColor: "bg-[#FFBC99]",
		modalType: CREATE_MODULE_MODAL
	},
	{
		title: "Release",
		description: "Register IP, Pre-Release to fans, Distribute to Streaming",
		icon: REALEASE_ICON,
		iconWidth: 18.75,
		iconHeight: 18.75,
		actionText: "Drop Now",
		bgColor: "bg-[#B1E5FC]",
		modalType: RELEASE_MODULE_MODAL
	},
	{
		title: "Promote",
		description: "Post, leverage followers and influencers, run AI Ads",
		icon: PROMOTE_ICON,
		iconWidth: 20.29,
		iconHeight: 18.75,
		actionText: "Send It",
		bgColor: "bg-[#A9E8C0]",
		modalType: PROMOTE_MODULE_MODAL
	},
	{
		title: "Engage",
		description: "Chat and stream with fans, make collectibles and games",
		icon: ENGAGE_ICON,
		iconWidth: 19.5,
		iconHeight: 16.5,
		actionText: "Show Love",
		bgColor: "bg-[#FFD88D]",
		modalType: ENGAGE_MODAL
	}
]
