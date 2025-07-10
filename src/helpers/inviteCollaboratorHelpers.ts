import { useDynamicStore } from "@/stores"

export const getDropdownLabel = (value: string): string => {
	switch (value) {
		case "sms":
			return "Invite by SMS"
		case "email":
			return "Invite by Email"
		case "opportunity":
			return !useDynamicStore.getState()?.engageFlow
				? "Create Opportunity"
				: useDynamicStore.getState()?.collabOpp
					? "Post a Collab Opp"
					: "Collaborate with Fans"
		case "metadata":
			return "Add IP Metadata"
		case "web2":
			return "Fulfill Web2 Standards"
		case "web3":
			return "Ping Web3 Protocol"
		case "landing":
			return "Create a Landing Page"
		case "token":
			return "Generate an Access Token"
		case "subscription":
			return "Create a Fan Subscription"
		case "releaseAudio":
			return "Release Audio"
		case "releaseVideo":
			return "Release Video"
		case "search_ads":
			return "Search Advertising"
		case "social_ads":
			return "Social Advertising"
		case "crowdfund":
			return "Crowdfund a Campaign"
		case "post_mention_twitter":
			return "Post and Mention on Twitter"
		default:
			return "Invite by Email"
	}
}
