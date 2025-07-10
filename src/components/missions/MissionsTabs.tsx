"use client"

import React from "react"

const MissionsTabs: React.FC<{
	activeTab: string
	setActiveTab: (tab: string) => void
}> = ({ activeTab, setActiveTab }) => {
	const tabs = ["New", "In Progress"]
	return (
		<div className="flex flex-wrap gap-2 items-start w-full text-base font-medium tracking-normal leading-relaxed text-gray-500 mt-[10px] max-md:max-w-full">
			{tabs.map((tab, index) => (
				<div
					key={index}
					className={`gap-10 self-stretch px-4 py-2 rounded-lg text-zinc-900 cursor-pointer ${activeTab === tab ? "bg-darkActiveGray text-zinc-900" : "bg-zinc-50"}`}
					onClick={() => setActiveTab(tab)}
				>
					{tab}
				</div>
			))}
		</div>
	)
}

export default MissionsTabs
