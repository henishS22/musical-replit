"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { LEADERBOARD_ICON } from "@/assets"
import { Button } from "@nextui-org/react"

import { TitleBadgeCard } from "../ui"
import InProgress from "./inProgress"
import MissionsTabs from "./MissionsTabs"
import MissionsWidget from "./new"

const Missions = () => {
	const [activeTab, setActiveTab] = useState("New")
	const router = useRouter()

	const renderTabContent = () => {
		switch (activeTab) {
			case "New":
				return <MissionsWidget />
			case "In Progress":
				return <InProgress />
			// case "Un-Published":
			// 	return <InProgress isPublished={false} />
			default:
				return null
		}
	}

	const LeaderboardBtn = () => (
		<Button
			className="px-4 py-2 text-sm font-bold tracking-normal leading-6 rounded-lg text-green-500 whitespace-nowrap bg-green-100 border-2 border-green-500"
			onPress={() => router.push("leaderboard")}
		>
			<span>
				<Image src={LEADERBOARD_ICON} alt="leaderboard" />
			</span>
			Leaderboard
		</Button>
	)

	return (
		<div className="flex flex-col gap-4">
			<TitleBadgeCard
				title="Missions"
				markColor="#8A8A8A"
				subComponent={<LeaderboardBtn />}
			>
				<MissionsTabs activeTab={activeTab} setActiveTab={setActiveTab} />
				{renderTabContent()}
			</TitleBadgeCard>
		</div>
	)
}

export default Missions
