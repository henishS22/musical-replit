
"use client"

import React, { useState } from "react"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Tabs, Tab, Skeleton, Card, CardBody } from "@nextui-org/react"

import { fetchNftsById, fetchGuildedNftById } from "@/app/api/query"

// Skeleton components
const NFTCardSkeleton = () => (
	<Card className="w-full">
		<CardBody className="p-0">
			<Skeleton className="rounded-lg w-full h-64" />
		</CardBody>
		<div className="p-4 space-y-3">
			<Skeleton className="h-6 w-3/4 rounded-lg" />
			<Skeleton className="h-4 w-1/2 rounded-lg" />
			<Skeleton className="h-8 w-full rounded-lg" />
		</div>
	</Card>
)

// Mock components - replace with actual implementations
const BuyNftCard = ({ nft }: { nft: any }) => (
	<Card className="w-full">
		<CardBody className="p-6">
			<h2 className="text-xl font-bold mb-4">{nft?.title || "NFT Details"}</h2>
			<div className="space-y-2">
				<p><strong>ID:</strong> {nft?._id}</p>
				<p><strong>Price:</strong> {nft?.price || "N/A"}</p>
				<p><strong>Owner:</strong> {nft?.owner || "N/A"}</p>
				{nft?.description && <p><strong>Description:</strong> {nft.description}</p>}
				{nft?.isGuildedNFT && <p className="text-blue-600"><strong>Guild NFT:</strong> Yes</p>}
			</div>
		</CardBody>
	</Card>
)

const TabContent = ({ nft, type }: { nft: any; type: string }) => (
	<div className="p-4">
		<h3 className="text-lg font-semibold mb-2">{type.charAt(0).toUpperCase() + type.slice(1)}</h3>
		<p>Content for {type} tab</p>
	</div>
)

const BuyNFTDetails: React.FC = () => {
	const { id } = useParams()
	const nftId = Array.isArray(id) ? id[0] : id
	const [selectedTab, setSelectedTab] = useState("collectibles")

	// First, try to fetch from Guild NFT API
	const { data: guildedNftData, isFetching: isGuildedNftFetching } = useQuery({
		queryKey: ["guildedNftData", nftId],
		queryFn: () => fetchGuildedNftById(nftId as string),
		enabled: !!nftId,
		staleTime: 1000 * 60 * 60 * 24,
		retry: false, // Don't retry if it fails, just try regular NFT API
		meta: {
			errorHandler: () => {} // Suppress error handling for guilded NFT API
		}
	})

	// If not a guilded NFT, fetch from regular NFT API
	const { data: regularNftData, isFetching: isRegularNftFetching } = useQuery({
		queryKey: ["nftData", nftId],
		queryFn: () => fetchNftsById(nftId as string),
		enabled: !!nftId && !guildedNftData?.isGuildedNFT && !isGuildedNftFetching,
		staleTime: 1000 * 60 * 60 * 24
	})

	// Determine which data to use
	const nftDetails = guildedNftData?.isGuildedNFT ? [guildedNftData] : regularNftData
	const isLoading = isGuildedNftFetching || isRegularNftFetching

	// Define tabs for regular NFTs
	const tabs = [
		{ id: "collectibles", label: "Collectibles" },
		{ id: "studio", label: "Studio" },
		{ id: "discussion", label: "Discussion" },
		{ id: "stream", label: "Stream" }
	]

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

	if (!nftDetails || nftDetails.length === 0) {
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
					<BuyNftCard nft={nftDetails[0]} />
				</div>

				{/* Right Column - Content */}
				<div className="space-y-6">
					{/* Only show tabs if it's NOT a Guild NFT */}
					{!nftDetails[0]?.isGuildedNFT && (
						<>
							{/* Mobile Tabs */}
							<div className="flex flex-col lg:hidden px-4 pt-4">
								<Tabs
									selectedKey={selectedTab}
									onSelectionChange={(key) => setSelectedTab(key as string)}
									aria-label="Buy NFT Tabs"
									className="w-full"
									classNames={{
										tabList: "bg-transparent p-0 gap-0 w-full",
										cursor: "bg-btnColor text-white",
										tab: "px-4 py-2 text-sm font-medium data-[selected=true]:text-white data-[selected=false]:text-gray-500 border-b border-gray-300",
										tabContent: "group-data-[selected=true]:text-white"
									}}
								>
									{tabs.map((tab) => (
										<Tab key={tab.id} title={tab.label}>
											<div className="py-4">
												<TabContent
													nft={nftDetails[0]}
													type={tab.id}
												/>
											</div>
										</Tab>
									))}
								</Tabs>
							</div>

							{/* Desktop Tabs */}
							<div className="hidden lg:flex flex-col px-4 pt-4">
								<Tabs
									selectedKey={selectedTab}
									onSelectionChange={(key) => setSelectedTab(key as string)}
									aria-label="Buy NFT Tabs"
									className="w-full"
									classNames={{
										tabList: "bg-transparent p-0 gap-0 w-full justify-start",
										cursor: "bg-btnColor text-white",
										tab: "px-6 py-3 text-base font-medium data-[selected=true]:text-white data-[selected=false]:text-gray-500 border-b border-gray-300",
										tabContent: "group-data-[selected=true]:text-white"
									}}
								>
									{tabs.map((tab) => (
										<Tab key={tab.id} title={tab.label}>
											<div className="py-6">
												<TabContent
													nft={nftDetails[0]}
													type={tab.id}
												/>
											</div>
										</Tab>
									))}
								</Tabs>
							</div>
						</>
					)}

					{/* For Guild NFTs, show simple content without tabs */}
					{nftDetails[0]?.isGuildedNFT && (
						<div className="px-4 pt-4">
							<div className="bg-gray-50 rounded-lg p-6">
								<h3 className="text-lg font-semibold text-gray-900 mb-2">
									Guild Pass Details
								</h3>
								<p className="text-gray-600">
									This is a Guild Pass NFT with special access privileges.
								</p>
								{nftDetails[0].description && (
									<div className="mt-4">
										<h4 className="font-medium text-gray-900 mb-2">Description</h4>
										<p className="text-gray-600">{nftDetails[0].description}</p>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default BuyNFTDetails
