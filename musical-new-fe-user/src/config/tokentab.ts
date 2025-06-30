import { DOLLAR_ICON, NFTSALE_ICON, NFTSOLD_ICON, NOTES_ICON } from "@/assets"

export const tokenTab = [
	{
		icon: NFTSALE_ICON,
		value: "45k",
		label: "NFTs for sale",
		iconColor: "text-textPrimary",
		iconBgColor: "bg-[#FFBC99]",
		key: "nftsForSale"
	},
	{
		icon: NFTSOLD_ICON,
		value: "4k",
		label: "NFT Sold",
		iconColor: "text-textPrimary",
		iconBgColor: "bg-[#FFBC99]",
		key: "nftsSold"
	},
	{
		icon: NOTES_ICON,
		value: "4k",
		label: "Notes Earned",
		iconColor: "text-textPrimary",
		iconBgColor: "bg-[#FFBC99]",
		key: "notesEarned"
	},
	{
		icon: DOLLAR_ICON,
		value: "405k",
		label: "USD Value",
		secondaryLabel: "(*with TGE price at $0.10)",
		iconColor: "text-textPrimary",
		iconBgColor: "bg-[#FFBC99]",
		key: "nftsUsdValue"
	}
]
