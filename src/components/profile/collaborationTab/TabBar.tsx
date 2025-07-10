"use client"

import React from "react"

interface TabData {
	label: string
	value: string
}

interface TabBarProps {
	tab: string
	setTab: (tab: string) => void
}

const TabBar: React.FC<TabBarProps> = ({ tab, setTab }) => {
	const tabs: TabData[] = [
		{ label: "Created", value: "created" },
		{ label: "Applied", value: "applied" }
	]

	return (
		<div className="flex flex-wrap gap-2.5 items-start text-sm font-medium tracking-normal leading-6 whitespace-nowrap border-b border-zinc-100 mt-4">
			{tabs.map((item, index) => (
				<div
					key={index}
					className={`self-stretch px-4 py-1.5 cursor-pointer ${
						item.value === tab
							? "border-b border-solid border-b-green-500 text-zinc-900"
							: "text-gray-500"
					}`}
					onClick={() => setTab(item.value)}
				>
					{item.label}
				</div>
			))}
		</div>
	)
}

export default TabBar
