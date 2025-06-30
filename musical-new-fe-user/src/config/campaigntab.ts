import { ORGANIC_ICON, PAID_ICON } from "@/assets"

export const campaignData = [
	{
		title: "Organic",
		subtitle: "",
		metrics: [
			{ label: "Number of posts", value: "23K", key: "posts" },
			{ label: "Impressions", value: "45K", key: "impressions" },
			{ label: "Reach", value: "67K", key: "reach" },
			{ label: "Video plays", value: "45K", key: "videoPlays" }
		],
		icon: ORGANIC_ICON,
		iconColor: "text-[#000000]",
		iconBgColor: "bg-[#A9E8C0]"
	},
	{
		title: "Paid",
		subtitle: "",
		metrics: [
			{ label: "Price", value: "23K", key: "price" },
			{ label: "Impressions", value: "45K", key: "impressions" },
			{ label: "Reach", value: "67K", key: "reach" },
			{ label: "CPM/CPC", value: "43K", key: "cpmCpc" },
			{ label: "video Plays", value: "45K", key: "videoPlays" }
		],
		icon: PAID_ICON,
		iconColor: "text-[#000000]",
		iconBgColor: "bg-[#A9E8C0]"
	}
]
