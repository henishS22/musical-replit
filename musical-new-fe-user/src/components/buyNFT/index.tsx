"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Tabs, Tab } from "@nextui-org/react"

import { fetchNftsById, fetchGuildedNftById } from "@/app/api/query"
import { BuyNftCard } from "./BuyNftCard"
import { TabContent } from "./TabContent"
import { NFTCardSkeleton } from "./NFTCardSkeleton"

const BuyNFTDetails: React.FC = () => {
	const { id } = useParams()
	const nftId = Array.isArray(id) ? id[0] : id
	const [selectedTab, setSelectedTab] = useState("collectibles")

	// First, fetch the regular NFT data to check if it's a Guild NFT
	const { data: nftData, isLoading: isNftLoading, error: nftError } = useQuery({
		queryKey: ["nft", nftId],
		queryFn: () => fetchNftsById(nftId),
		enabled: !!nftId,
		staleTime: 1000 * 60 * 5,
		retry: 2
	})

	// Check if this is a Guild NFT
	const isGuildedNFT = nftData?.isGuildedNFT === true

	// Conditionally fetch Guild NFT data if it's a Guild NFT
	const { data: guildedNftData, isLoading: isGuildedLoading, error: guildedError } = useQuery({
		queryKey: ["guilded-nft", nftId],
		queryFn: () => fetchGuildedNftById(nftId),
		enabled: !!nftId && isGuildedNFT,
		staleTime: 1000 * 60 * 5,
		retry: 2
	})

	// Use the appropriate data source
	const displayData = isGuildedNFT ? guildedNftData : nftData
	const isLoading = isNftLoading || (isGuildedNFT && isGuildedLoading)
	const error = nftError || (isGuildedNFT && guildedError)

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<NFTCardSkeleton />
					<NFTCardSkeleton />
				</div>
			</div>
		)
	}

	if (error || !displayData) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center py-12">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">NFT Not Found</h2>
					<p className="text-gray-600">
						The NFT you're looking for doesn't exist or has been removed.
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Left Column - NFT Card */}
				<div className="lg:sticky lg:top-8 lg:self-start">
					<BuyNftCard nft={displayData} />
				</div>

				{/* Right Column - Tabs and Content */}
				<div className="space-y-6">
					{/* Only show tabs if it's NOT a Guild NFT */}
					{!isGuildedNFT && (
						<Tabs
							selectedKey={selectedTab}
							onSelectionChange={(key) => setSelectedTab(key as string)}
							variant="underlined"
							classNames={{
								tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
								cursor: "w-full bg-primary",
								tab: "max-w-fit px-0 h-12",
								tabContent: "group-data-[selected=true]:text-primary"
							}}
						>
							<Tab
								key="collectibles"
								title={
									<div className="flex items-center space-x-2">
										<span>Collectibles</span>
									</div>
								}
							>
								<TabContent nft={displayData} type="collectibles" />
							</Tab>
							<Tab
								key="studio"
								title={
									<div className="flex items-center space-x-2">
										<span>Studio</span>
									</div>
								}
							>
								<TabContent nft={displayData} type="studio" />
							</Tab>
							<Tab
								key="discussion"
								title={
									<div className="flex items-center space-x-2">
										<span>Discussion</span>
									</div>
								}
							>
								<TabContent nft={displayData} type="discussion" />
							</Tab>
							<Tab
								key="stream"
								title={
									<div className="flex items-center space-x-2">
										<span>Stream</span>
									</div>
								}
							>
								<TabContent nft={displayData} type="stream" />
							</Tab>
						</Tabs>
					)}

					{/* For Guild NFTs, show a simple message or different content */}
					{isGuildedNFT && (
						<div className="bg-gray-50 rounded-lg p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								Guild Pass Details
							</h3>
							<p className="text-gray-600">
								This is a Guild Pass NFT with special access privileges.
							</p>
							{displayData.description && (
								<div className="mt-4">
									<h4 className="font-medium text-gray-900 mb-2">Description</h4>
									<p className="text-gray-600">{displayData.description}</p>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default BuyNFTDetails