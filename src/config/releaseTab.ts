import { ORGANIC_ICON, RANK_ICON, TOP_ICON } from "@/assets"

export const releaseData = [
	{
		icon: RANK_ICON,
		label: "Artist Rank",
		iconColor: "text-textPrimary",
		iconBgColor: "bg-[#B1E5FC]",
		key: "artistRank",
		percentageKey: "percentageFollowers"
	},
	{
		icon: ORGANIC_ICON,
		label: "Cross Platform Performance",
		iconColor: "text-textPrimary",
		iconBgColor: "bg-[#B1E5FC]",
		key: "cpp",
		percentageKey: "percentagePost"
	},
	{
		icon: TOP_ICON,
		label: "Top Tracks",
		iconColor: "text-textPrimary",
		iconBgColor: "bg-[#B1E5FC]",
		key: "topTracksByPlatform",
		percentageKey: "percentageReach"
	}
]
