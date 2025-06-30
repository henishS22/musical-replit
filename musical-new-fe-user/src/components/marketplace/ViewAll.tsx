"use client"

import React from "react"

import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb"

import LatestCreators from "./LatestCreators"
import LatestMissions from "./quest/LatestMissions"
import ExchangeNFTs from "./sections/ExchangeNFTs"
import FeaturedProjects from "./sections/FeaturedProjects"
import TrendingTokens from "./sections/TrendingTokens"

interface ViewAllProps {
	onBack: () => void
	activeSection: string
}

const ViewAll: React.FC<ViewAllProps> = ({ onBack, activeSection }) => {
	const dropdownConfig = {
		isStatic: true,
		activeLabel: activeSection,
		value: activeSection,
		options: [{ key: activeSection, label: activeSection }],
		onChange: () => {},
		isStaticIcon: false
	}

	const renderSection = () => {
		switch (activeSection) {
			case "Trending Spaces":
				return <TrendingTokens />
			case "Exchange NFTs":
				return <ExchangeNFTs />
			case "Featured Projects":
				return <FeaturedProjects />
			case "Latest Creators":
				return <LatestCreators showAll={true} />
			case "Latest Missions":
				return <LatestMissions showAll={true} />
			default:
				return null
		}
	}

	return (
		<>
			<Breadcrumb
				title="Marketplace"
				dropdownConfig={dropdownConfig}
				onBack={onBack}
			/>
			{renderSection()}
		</>
	)
}

export default ViewAll
