"use client"

import React from "react"

interface MenuItem {
	label: string
	value: string
}

const menuItems: MenuItem[] = [
	{ label: "Personal Info", value: "personalInfo" },
	{ label: "Styles & Skills", value: "stylesAndSkills" },
	{ label: "Change Password", value: "changePassword" }
]

const SideMenu: React.FC<{
	activeTab: string
	setActiveTab: (tab: string) => void
}> = ({ activeTab, setActiveTab }) => {
	return (
		<div className="flex flex-col text-base font-semibold tracking-normal leading-relaxed text-gray-500 min-w-[240px] w-[280px] mt-6">
			{menuItems.map((item, index) => (
				<div
					key={index}
					className={`gap-10 self-stretch px-4 py-2 ${
						index > 0 ? "mt-2" : ""
					} w-full rounded-lg cursor-pointer ${
						item.value === activeTab ? "bg-zinc-100 text-zinc-900" : "bg-white"
					}`}
					onClick={() => setActiveTab(item.value)}
				>
					{item.label}
				</div>
			))}
		</div>
	)
}

export default SideMenu
