"use client"

import { useState } from "react"

import { TitleBadgeCard } from "../ui"
import External from "./external"
import MissionHistoryTabs from "./MissionHistoryTabs"
import Platform from "./platform"

const MissionHistory = () => {
	const [activeTab, setActiveTab] = useState("Platform")

	const renderTabContent = () => {
		switch (activeTab) {
			case "Platform":
				return <Platform />
			case "External":
				return <External isPublished={true} />
			default:
				return null
		}
	}

	return (
		<div className="flex flex-col gap-4">
			<TitleBadgeCard title="Mission History" markColor="#8A8A8A">
				<MissionHistoryTabs activeTab={activeTab} setActiveTab={setActiveTab} />
				{renderTabContent()}
			</TitleBadgeCard>
		</div>
	)
}

export default MissionHistory
