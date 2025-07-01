"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"

import MarketHome from "./MarketHome"
import ViewAll from "./ViewAll"

const Marketplace = () => {
	const router = useRouter()
	const [viewAllMode, setViewAllMode] = useState<string | null>(null)

	const handleViewAll = (section: string) => {
		if (section === "Guild Passes") {
			router.push("/guild-passes")
		} else {
			setViewAllMode(section)
		}
	}

	const handleBack = () => {
		setViewAllMode(null)
	}

	return (
		<div>
			<div className="bg-white rounded-xl p-6 flex flex-col gap-8">
				<div className="bg-videoBtnGreen p-[28px] text-center rounded-xl font-bold text-[20px] leading-[27.32px] text-textPrimary">
					Start discovering artists and gaining access to perks
				</div>

				{viewAllMode ? (
					<ViewAll onBack={handleBack} activeSection={viewAllMode} />
				) : (
					<MarketHome onViewAll={handleViewAll} />
				)}
			</div>
		</div>
	)
}

export default Marketplace