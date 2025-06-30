"use client"

import React from "react"

function TabButton({
	activeTab,
	setActiveTab
}: {
	activeTab: string
	setActiveTab: (tab: string) => void
}) {
	const tabs = ["recent", "most_popular", "saved"]
	const type = {
		recent: "Recent",
		most_popular: "Most Popular",
		saved: "Saved"
	}

	return (
		<div className="flex gap-2 items-start self-start text-base font-medium tracking-normal leading-relaxed text-gray-500 z-10">
			{tabs.map((tab, index) => (
				<div
					key={index}
					className={`gap-10 self-stretch px-4 py-2 whitespace-nowrap rounded-lg cursor-pointer ${
						activeTab === tab ? "bg-darkActiveGray text-zinc-900" : "bg-zinc-50"
					}`}
					onClick={() => setActiveTab(tab)}
				>
					{type[tab as keyof typeof type]}
				</div>
			))}
		</div>
	)
}

export default TabButton
