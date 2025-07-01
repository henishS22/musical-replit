
"use client"

import { ComingSoon } from "../ui/commingSoon/commingSoon"
import Collectibles from "./sections/Collectibles"
import { Discussion } from "./sections/discussion"
import { Stream } from "./sections/stream"
import Studio from "./sections/Studio"

interface TabContentProps {
	selectedTab: string
	nftId: string
	signature: string | null
	message: string | null
}

export default function TabContent({
	selectedTab,
	nftId,
	signature,
	message
}: TabContentProps) {
	switch (selectedTab) {
		case "studio":
			return (
				<Studio
					projectId=""
					nftId={nftId}
					signature={signature || ""}
					message={message || ""}
				/>
			)
		case "discussion":
			return <Discussion projectId="" signature={signature || ""} />
		case "stream":
			return <Stream nftId={nftId} signature={signature || ""} />
		case "collectibles":
			return (
				<Collectibles
					projectId=""
					nftId={nftId}
					signature={signature || ""}
					message={message || ""}
				/>
			)
		case "quest":
			return <ComingSoon />
		default:
			return null
	}
}
