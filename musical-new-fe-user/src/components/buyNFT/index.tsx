"use client"

import { useState } from "react"
import { toast } from "react-toastify"
import Image from "next/image"
import { useParams } from "next/navigation"

import { fetchNftsById, fetchGuildedNftById } from "@/app/api/query"
import { PROFILE_IMAGE } from "@/assets"
import { BUY_NFT_MODAL } from "@/constant/modalType"
import { CONNECT_WALLET } from "@/constant/toastMessages"
import { generateQueryParams } from "@/helpers"
import { Tab, Tabs } from "@nextui-org/react"
import { useQuery } from "@tanstack/react-query"
import { useActiveWallet } from "thirdweb/react"

import { buyNftTabs } from "@/config/buyNft"
import { useModalStore, useUserStore } from "@/stores"

import BuyNftCard from "./BuyNftCard"
import TabContent from "./TabContent"

export default function BuyNFTDetails() {
	const [selectedTab, setSelectedTab] = useState("studio")
	const [signature, setSignature] = useState<string | null>(null)
	const [message, setMessage] = useState<string | null>(null)
	const { user } = useUserStore()

	const activeWallet = useActiveWallet()
	const walletAddress = activeWallet?.getAccount()?.address

	const { showCustomModal } = useModalStore()
	const { id } = useParams()

	const queryParams = generateQueryParams({
		...(user
			? { owner: user.id }
			: activeWallet && { address: walletAddress ?? "" })
	})

	// First, try to fetch from Guild NFT API
	const { data: guildedNftData, isFetching: isGuildedNftFetching } = useQuery({
		queryKey: ["guildedNftData", id],
		queryFn: () => fetchGuildedNftById(id as string),
		enabled: !!id,
		staleTime: 1000 * 60 * 60 * 24,
		retry: false // Don't retry if it fails, just try regular NFT API
	})

	// If not a guilded NFT, fetch from regular NFT API
	const { data: regularNftData, isFetching: isRegularNftFetching } = useQuery({
		queryKey: ["nftData", id],
		queryFn: () => fetchNftsById(id as string, queryParams),
		enabled: !!id && !guildedNftData?.isGuildedNFT && !isGuildedNftFetching,
		staleTime: 1000 * 60 * 60 * 24
	})

	// Use guilded NFT data if available and is a guilded NFT, otherwise use regular NFT data
	const nftDetails = guildedNftData?.isGuildedNFT ? [guildedNftData] : regularNftData
	const isNftDetailsFetching = isGuildedNftFetching || isRegularNftFetching

	// Filter tabs based on user presence
	const filteredTabs = user
		? buyNftTabs
		: buyNftTabs.filter((tab) => tab.id !== "discussion")

	return (
		<div className="min-h-screen relative">
			{/* Background Image with Blur */}
			<div className="fixed inset-0 z-0">
				<Image
					src={nftDetails?.[0]?.artworkUrl}
					alt="NFT Background"
					fill
					className="object-cover"
				/>
				<div className="absolute inset-0 backdrop-blur-xl" />
			</div>
			<div className="relative z-10">
				<BuyNftCard
					imageUrl={nftDetails?.[0]?.artworkUrl || ""}
					creatorImage={nftDetails?.[0]?.user?.profile_img || PROFILE_IMAGE}
					creatorName={nftDetails?.[0]?.user?.name || ""}
					title={nftDetails?.[0]?.title || ""}
					description={nftDetails?.[0]?.description || ""}
					price={`$ ${nftDetails?.[0]?.priceInUsd?.toFixed(2) || "0.00"}` || "0.00 USD"}
					onBuyNow={() => {
						if (!activeWallet) {
							toast.error(CONNECT_WALLET)
							return
						}
						showCustomModal({
							customModalType: BUY_NFT_MODAL,
							tempCustomModalData: {
								quantity:
									nftDetails?.[0]?.initialSupply -
									nftDetails?.[0]?.quantityPurchased,
								listingId: nftDetails?.[0]?.listingId,
								price: nftDetails?.[0]?.price
							}
						})
					}}
					isLoading={isNftDetailsFetching}
					tokenId={nftDetails?.[0]?.tokenId}
					setSignature={setSignature}
					setMessage={setMessage}
					showVerifyButton={true}
					ownerId={nftDetails?.[0]?.user?._id}
					txHash={nftDetails?.[0]?.transactionHash}
				/>
				{!nftDetails?.[0]?.isGuildedNFT && (
					<div className="bg-white rounded-xl shadow-lg">
						<Tabs
							aria-label="NFT Information"
							selectedKey={selectedTab}
							onSelectionChange={(key) => setSelectedTab(key.toString())}
							variant="underlined"
							classNames={{
								tabList: "gap-6 w-full relative px-6 border-b border-[#EBECED]",
								cursor: "w-full bg-[#1DB954] h-[2px]",
								tab: "max-w-fit px-0 h-12",
								tabContent: "font-medium text-[15px]"
							}}
						>
							{filteredTabs?.map((tab) => (
								<Tab key={tab.id} title={tab.label}>
									<TabContent
										type={tab.id}
										projectId={nftDetails?.[0]?.project?._id || ""}
										nftId={id as string}
										signature={signature || ""}
										message={message || ""}
									/>
								</Tab>
							))}
						</Tabs>
					</div>
				)}
			</div>
		</div>
	)
}