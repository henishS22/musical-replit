import { DIGITAL_ADS, GO_VIRAL, POST_SOCIAL } from "@/assets"
import {
	COMING_SOON_MODAL,
	DIGITAL_ADS_MODAL,
	GO_VIRAL_MODAL,
	POST_SOCIAL_MODAL,
	PROMOTE_CREATE_MODAL
} from "@/constant/modalType"

export const promoteOptions = [
	{
		title: "Post to Social",
		icon: POST_SOCIAL,
		options: [
			{
				title: "Use Existing Content:",
				value: "existing_content",
				type: POST_SOCIAL_MODAL,
				description: "Upload content you gave & quickly post to all networks"
			},
			{
				title: "Create Something New:",
				value: "new_content",
				type: PROMOTE_CREATE_MODAL,
				description: "Record something, leverage creative tools, and post"
			},
			{
				title: "Schedule Posts:",
				value: "schedule",
				type: POST_SOCIAL_MODAL,
				description: "Create a calendar of content to stay active and engaged"
			}
		]
	},
	{
		title: "Grow Connections",
		icon: GO_VIRAL,
		options: [
			{
				title: "Create a Space:",
				value: "landing_page",
				type: COMING_SOON_MODAL,
				description: "You'll need a new page for most new music campaigns"
			},
			{
				title: "Start a Fan Quest:",
				value: "fan_quest",
				type: COMING_SOON_MODAL,
				description:
					"Reward your fans for buying, sharing and consuming your content"
			},
			{
				title: "Work with Music Influencers:",
				value: "music_influencers",
				type: GO_VIRAL_MODAL,
				description: "Leverage paid influencers to help your content go viral"
			}
		]
	},
	{
		title: "Run Digital Ads",
		icon: DIGITAL_ADS,
		options: [
			{
				title: "Search Advertising:",
				value: "search_ads",
				type: COMING_SOON_MODAL,
				description:
					"Get in front of people looking for you and similar content"
			},
			{
				title: "Social Advertising:",
				value: "social_ads",
				type: COMING_SOON_MODAL,
				description: "Put your music in front of the largest audiences online"
			},
			{
				title: "Crowdfund a Campaign:",
				value: "crowdfund_project",
				type: DIGITAL_ADS_MODAL,
				description: "No budget, no problem! Start a campaign to raise money."
			}
		]
	}
]
