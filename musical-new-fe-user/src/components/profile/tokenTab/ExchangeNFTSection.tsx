"use client"

import React from "react"

import { NoDataFound } from "@/components/ui"
import { ExchangeNftList } from "@/types/apiResponse"
import { Button, Skeleton } from "@nextui-org/react"

import { useUserStore } from "@/stores"

import NFTCard from "./NftCard"

interface ExchangeNftProps {
	heading: string
	showViewAll?: boolean
	classNames?: {
		heading?: string
	}
	onViewAll?: () => void
	nftData?: ExchangeNftList[] | []
	loading?: boolean
	basePath?: string
	viewMode?: "grid" | "slider"
	slidesPerView?: number | "auto"
	spaceBetween?: number
	isMarketplace?: boolean
}

const ExchangeNFTSection: React.FC<ExchangeNftProps> = ({
	heading,
	showViewAll = true,
	classNames,
	onViewAll,
	nftData,
	loading,
	basePath = "",
	isMarketplace = false
}) => {
	const { userData } = useUserStore()
	return (
		<div className="flex flex-col w-full">
			<div className="flex flex-wrap gap-5 justify-between items-center w-full mb-5">
				<div
					className={`text-xl font-bold tracking-normal leading-tight text-textPrimary ${classNames?.heading}`}
				>
					{heading}
				</div>
				<div className="flex gap-3 items-center">
					{showViewAll && (
						<Button
							onPress={onViewAll}
							type="submit"
							className="px-5 py-3 gap-2 rounded-lg bg-btnColor text-white font-bold text-[15px]"
						>
							View All
						</Button>
					)}
				</div>
			</div>

			{loading ? (
				<div className="d-flex flex-wrap w-full gap-3 md:gap-4">
					{[...Array(4)].map((_, index) => (
						<div key={index} className="flex flex-col gap-2 w-full">
							<Skeleton className="rounded-lg w-full">
								<div className="h-[200px] rounded-lg bg-default-300"></div>
							</Skeleton>
							<div className="space-y-3">
								<Skeleton className="w-3/5 rounded-lg">
									<div className="h-3 w-3/5 rounded-lg bg-default-300"></div>
								</Skeleton>
								<Skeleton className="w-4/5 rounded-lg">
									<div className="h-3 w-4/5 rounded-lg bg-default-300"></div>
								</Skeleton>
							</div>
						</div>
					))}
				</div>
			) : (
				<>
					{nftData && nftData?.length > 0 ? (
						// Grid view - Better space utilization with auto-fit
						<div className="flex flex-wrap w-full gap-3 md:gap-4">
							{nftData.map((nft) => (
								<NFTCard
									redirectPath={`${basePath}/${nft._id}`}
									artworkUrl={
										isMarketplace
											? nft?.user1_nft_details[0]?.artworkUrl
											: nft.user1.id !== userData?._id
												? nft.user1_nft_details[0]?.artworkUrl
												: nft.user2_nft_details[0]?.artworkUrl
									}
									title={
										isMarketplace
											? nft.user1_nft_details[0]?.title
											: nft.user1.id !== userData?._id
												? nft.user1_nft_details[0]?.title
												: nft.user2_nft_details[0]?.title
									}
									artist={
										isMarketplace
											? nft.user1_details[0]?.name
											: nft.user1.id !== userData?._id
												? nft.user1_details[0]?.name
												: nft.user2_details[0]?.name
									}
									id={nft.nft}
									key={nft._id}
								/>
							))}
						</div>
					) : (
						<NoDataFound message="No Tokens found" />
					)}
				</>
			)}
		</div>
	)
}

export default ExchangeNFTSection
