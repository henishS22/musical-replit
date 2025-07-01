
"use client"

import { ComingSoon } from "../ui/commingSoon/commingSoon"
import Collectibles from "./sections/Collectibles"
import { Discussion } from "./sections/discussion"
import { Stream } from "./sections/stream"
import Studio from "./sections/Studio"

interface TabContentProps {
	type: string
	projectId: string
	nftId: string
	signature: string
	message: string
}

export default function TabContent({
	type,
	projectId,
	nftId,
	signature,
	message
}: TabContentProps) {
	switch (type) {
		case "studio":
			return (
				<Studio
					projectId={projectId}
					nftId={nftId}
					signature={signature}
					message={message}
				/>
			)
		case "discussion":
			return <Discussion projectId={projectId} signature={signature} />
		case "stream":
			return <Stream nftId={nftId} signature={signature} />
		case "collectibles":
			return (
				<Collectibles
					projectId={projectId}
					nftId={nftId}
					signature={signature}
					message={message}
				/>
			)
		case "quest":
			return <ComingSoon />
		default:
			return null
	}
}
