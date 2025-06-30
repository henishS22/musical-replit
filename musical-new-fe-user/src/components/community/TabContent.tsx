"use client"

import { useState } from "react"

import Opportunity from "../opportunity/Opportunity"
import CommunityDiscussion from "./communityDiscussions/CommunityDiscussion"
import CommunityForum from "./communityForum/CommunityForum"

interface TabContentProps {
	type: "collab" | "discussion"
}

export default function TabContent({ type }: TabContentProps) {
	const [selectedDiscussion, setSelectedDiscussion] = useState<string | null>(
		null
	)

	if (selectedDiscussion) {
		return (
			<CommunityDiscussion
				topicId={selectedDiscussion}
				onBack={() => setSelectedDiscussion(null)}
			/>
		)
	}

	return (
		<div className="w-full">
			{type === "collab" ? (
				<Opportunity />
			) : (
				<CommunityForum onDiscussionSelect={setSelectedDiscussion} />
			)}
		</div>
	)
}
