"use client"

import React, { useRef, useState } from "react"
import Image from "next/image"

import { LEFT_ARROW, RIGHT_ARROW } from "@/assets"
import { INft } from "@/types/apiResponse"
import { Button, Skeleton } from "@nextui-org/react"
import type SwiperCore from "swiper"
import { Navigation } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

import "swiper/css/navigation"

import NFTCard from "./NftCard"
// Import Swiper styles
import "swiper/css"

import { NoDataFound } from "@/components/ui"

interface MadeNftProps {
	heading: string
	showViewAll?: boolean
	classNames?: {
		heading?: string
	}
	onViewAll?: () => void
	nftData?: INft[]
	loading?: boolean
	basePath?: string
	viewMode?: "grid" | "slider" // Control view mode
	slidesPerView?: number | "auto" // Control number of slides per view
	spaceBetween?: number // Control space between slides
}

const MadeNFTSection: React.FC<MadeNftProps> = ({
	heading,
	showViewAll = true,
	classNames,
	onViewAll,
	nftData,
	loading,
	basePath = "",
	viewMode = "grid",
	slidesPerView = "auto",
	spaceBetween = 22
}) => {
	const [swiper, setSwiper] = useState<SwiperCore | null>(null)
	const [navigationState, setNavigationState] = useState({
		isBeginning: true,
		isEnd: false
	})

	const navigationPrevRef = useRef<HTMLButtonElement>(null)
	const navigationNextRef = useRef<HTMLButtonElement>(null)

	const updateNavigationState = () => {
		if (swiper) {
			setNavigationState({
				isBeginning: swiper.isBeginning,
				isEnd: swiper.isEnd
			})
		}
	}

	// Add this to limit data in grid mode
	const displayData = viewMode === "grid" ? nftData?.slice(0, 4) : nftData

	// Determine if we should show the view all button
	const shouldShowViewAll =
		showViewAll && viewMode === "grid" && (nftData?.length || 0) > 4

	return (
		<div className="flex flex-col w-full">
			<div className="flex flex-wrap gap-5 justify-between items-center w-full mb-5">
				<div
					className={`text-xl font-bold tracking-normal leading-tight text-textPrimary ${classNames?.heading}`}
				>
					{heading}
				</div>
				<div className="flex gap-3 items-center">
					{shouldShowViewAll && (
						<Button
							onPress={onViewAll}
							type="submit"
							className="px-5 py-3 gap-2 rounded-lg bg-btnColor text-white font-bold text-[15px]"
						>
							View All
						</Button>
					)}
					{viewMode === "slider" && (
						<div className="flex gap-3">
							<button
								ref={navigationPrevRef}
								className={`cursor-pointer flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 
									${navigationState.isBeginning ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
								aria-label="Previous slide"
								disabled={navigationState.isBeginning}
							>
								<Image
									loading="lazy"
									src={LEFT_ARROW}
									className="object-contain w-6 h-6"
									alt="Previous"
									width={24}
									height={24}
								/>
							</button>
							<button
								ref={navigationNextRef}
								className={`cursor-pointer flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200
									${navigationState.isEnd ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
								aria-label="Next slide"
								disabled={navigationState.isEnd}
							>
								<Image
									loading="lazy"
									src={RIGHT_ARROW}
									className="object-contain w-6 h-6"
									alt="Next"
									width={24}
									height={24}
								/>
							</button>
						</div>
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
						viewMode === "grid" ? (
							// Grid view - Using displayData for limited data
							<div className="flex flex-wrap w-full gap-3 md:gap-4">
								{displayData?.map((nft) => (
									<NFTCard
										redirectPath={`${basePath}/${nft._id}`}
										artworkUrl={nft?.artworkUrl || ""}
										title={nft?.title || ""}
										artist={nft?.user?.name || ""}
										id={nft?._id || ""}
										key={nft._id}
									/>
								))}
							</div>
						) : (
							// Slider view - Using full nftData
							<div className="w-full">
								<Swiper
									modules={[Navigation]}
									navigation={{
										prevEl: navigationPrevRef.current,
										nextEl: navigationNextRef.current
									}}
									onSwiper={(swiperInstance) => {
										setSwiper(swiperInstance)
										setTimeout(() => {
											updateNavigationState()
										}, 0)
									}}
									onSlideChange={() => {
										updateNavigationState()
									}}
									onReachBeginning={() => {
										setNavigationState((prev) => ({
											...prev,
											isBeginning: true
										}))
									}}
									onReachEnd={() => {
										setNavigationState((prev) => ({ ...prev, isEnd: true }))
									}}
									spaceBetween={spaceBetween}
									slidesPerView={slidesPerView}
									breakpoints={{
										320: {
											slidesPerView: "auto",
											spaceBetween: 10
										},
										640: {
											slidesPerView: "auto",
											spaceBetween: 15
										},
										768: {
											slidesPerView: "auto",
											spaceBetween: 20
										},
										1024: {
											slidesPerView: "auto",
											spaceBetween: spaceBetween
										}
									}}
									className="nft-swiper"
								>
									{nftData.map((nft) => (
										<SwiperSlide
											key={nft._id}
											className="h-auto"
											style={{
												width: "auto",
												minWidth: "244px",
												maxWidth: "300px"
											}}
										>
											<div className="p-1">
												<NFTCard
													redirectPath={`${basePath}/${nft._id}`}
													artworkUrl={nft?.artworkUrl || ""}
													title={nft?.title || ""}
													artist={nft?.user?.name || ""}
													id={nft?._id || ""}
												/>
											</div>
										</SwiperSlide>
									))}
								</Swiper>
							</div>
						)
					) : (
						<NoDataFound message="No Tokens found" />
					)}
				</>
			)}
		</div>
	)
}

export default MadeNFTSection
