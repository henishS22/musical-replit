"use client"

import React from "react"

function ProjectTabs({
	activeTab,
	setActiveTab,
	isOwner
}: {
	activeTab: string
	setActiveTab: (tab: string) => void
	isOwner: boolean
}) {
	const tabColors: Record<string, string> = {
		Studio: "bg-darkActiveGray",
		Create: "bg-[#FFBC99]",
		Release: "bg-[#B1E5FC]",
		Promote: "bg-[#A9E8C0]",
		Engage: "bg-[#FFD88D]"
	}

	const tabs = isOwner
		? ["Studio", "Create", "Release", "Promote", "Engage"]
		: ["Studio"]

	return (
		<div className="flex gap-2 items-start self-start text-base font-medium tracking-normal leading-relaxed text-gray-500 z-10">
			{tabs.map((tab, index) => (
				<div
					key={index}
					className={`gap-10 self-stretch px-4 py-2 whitespace-nowrap rounded-lg cursor-pointer ${
						activeTab === tab
							? `${tabColors[tab]} text-zinc-900`
							: "bg-transparent"
					}`}
					onClick={() => setActiveTab(tab)}
				>
					{tab}
				</div>
			))}
		</div>
	)
}

export default ProjectTabs
