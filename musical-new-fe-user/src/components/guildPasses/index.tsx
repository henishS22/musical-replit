
"use client"

import React, { useState } from "react"
import { useInView } from "react-intersection-observer"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { fetchGuildedNfts, fetchReListedNfts } from "@/app/api/query"
import { generateQueryParams } from "@/helpers"
import { 
	Button, 
	Skeleton, 
	Card, 
	CardBody, 
	CardFooter, 
	Tabs, 
	Tab,
	Select,
	SelectItem,
	Input
} from "@nextui-org/react"
import { useInfiniteQuery } from "@tanstack/react-query"

import { NoDataFound } from "../ui"

const GuildedNFTSkeleton = () => (
	<Card className="w-full">
		<CardBody className="p-0">
			<Skeleton className="rounded-lg w-full h-48" />
		</CardBody>
		<CardFooter className="flex flex-col items-start gap-2 p-4">
			<Skeleton className="h-4 w-3/4 rounded-lg" />
			<Skeleton className="h-3 w-1/2 rounded-lg" />
			<Skeleton className="h-6 w-20 rounded-lg" />
		</CardFooter>
	</Card>
)

const GuildPassesPage: React.FC = () => {
	const router = useRouter()
	const { ref: loadMoreRef, inView } = useInView()
	const [activeTab, setActiveTab] = useState("first-time")
	const [sortBy, setSortBy] = useState("newest")
	const [searchQuery, setSearchQuery] = useState("")

	const { 
		data: firstTimeData, 
		fetchNextPage: fetchNextPageFirstTime, 
		hasNextPage: hasNextPageFirstTime, 
		isFetchingNextPage: isFetchingNextPageFirstTime, 
		isLoading: isLoadingFirstTime,
		error: errorFirstTime
	} = useInfiniteQuery({
		queryKey: ["guilded-nfts", "first-time", sortBy, searchQuery],
		queryFn: async ({ pageParam = 1 }) => {
			const url = generateQueryParams({
				page: pageParam,
				limit: 16,
				isListed: true
			})
			return fetchGuildedNfts(url)
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			const totalItems = lastPage?.pagination?.total || 0
			const currentPage = lastPage?.pagination?.page || 1
			const limit = lastPage?.pagination?.limit || 16
			const nextPage = currentPage + 1
			return currentPage * limit < totalItems ? nextPage : undefined
		},
		staleTime: 1000 * 60 * 5,
		enabled: activeTab === "first-time"
	})

	const { 
		data: reListedData, 
		fetchNextPage: fetchNextPageReListed, 
		hasNextPage: hasNextPageReListed, 
		isFetchingNextPage: isFetchingNextPageReListed, 
		isLoading: isLoadingReListed,
		error: errorReListed
	} = useInfiniteQuery({
		queryKey: ["re-listed-nfts", sortBy, searchQuery],
		queryFn: async ({ pageParam = 1 }) => {
			const url = generateQueryParams({
				page: pageParam,
				limit: 16,
				isListed: true
			})
			return fetchReListedNfts(url)
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			const totalItems = lastPage?.pagination?.total || 0
			const currentPage = lastPage?.pagination?.page || 1
			const limit = lastPage?.pagination?.limit || 16
			const nextPage = currentPage + 1
			return currentPage * limit < totalItems ? nextPage : undefined
		},
		staleTime: 1000 * 60 * 5,
		enabled: activeTab === "re-listed"
	})

	const currentData = activeTab === "first-time" ? firstTimeData : reListedData
	const currentFetchNextPage = activeTab === "first-time" ? fetchNextPageFirstTime : fetchNextPageReListed
	const currentHasNextPage = activeTab === "first-time" ? hasNextPageFirstTime : hasNextPageReListed
	const currentIsFetchingNextPage = activeTab === "first-time" ? isFetchingNextPageFirstTime : isFetchingNextPageReListed
	const currentIsLoading = activeTab === "first-time" ? isLoadingFirstTime : isLoadingReListed
	const currentError = activeTab === "first-time" ? errorFirstTime : errorReListed

	const guildedNfts = React.useMemo(() => {
		return currentData?.pages.flatMap((page) => page?.data ?? []) || []
	}, [currentData])

	React.useEffect(() => {
		if (inView && currentHasNextPage && !currentIsFetchingNextPage) {
			currentFetchNextPage()
		}
	}, [inView, currentHasNextPage, currentIsFetchingNextPage, currentFetchNextPage])

	const handleNftClick = (nftId: string) => {
		router.push(`/buy-nft/${nftId}`)
	}

	const formatPrice = (nft: any) => {
		if (nft.ethereumPrice) {
			return `${nft.ethereumPrice.toFixed(4)} ETH`
		}
		if (nft.maticPrice) {
			return `${nft.maticPrice.toFixed(4)} MATIC`
		}
		if (nft.price) {
			return `$${nft.price}`
		}
		if (nft.priceInUsd) {
			return `$${nft.priceInUsd.toFixed(2)}`
		}
		return "$499"
	}

	const filteredNfts = React.useMemo(() => {
		let filtered = [...guildedNfts]
		
		// Apply search filter
		if (searchQuery.trim()) {
			filtered = filtered.filter(nft => 
				nft.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				nft.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				nft.user_array?.[0]?.name?.toLowerCase().includes(searchQuery.toLowerCase())
			)
		}

		// Apply sorting
		switch (sortBy) {
			case "price-low":
				filtered.sort((a, b) => {
					const priceA = a.ethereumPrice || a.maticPrice || a.priceInUsd || 499
					const priceB = b.ethereumPrice || b.maticPrice || b.priceInUsd || 499
					return priceA - priceB
				})
				break
			case "price-high":
				filtered.sort((a, b) => {
					const priceA = a.ethereumPrice || a.maticPrice || a.priceInUsd || 499
					const priceB = b.ethereumPrice || b.maticPrice || b.priceInUsd || 499
					return priceB - priceA
				})
				break
			case "newest":
			default:
				filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
				break
		}

		return filtered
	}, [guildedNfts, searchQuery, sortBy])

	if (currentError) {
		return (
			<div className="container mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold mb-8">Guild Passes</h1>
				<NoDataFound message="Failed to load Guild Passes. Please try again later." />
			</div>
		)
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex flex-col gap-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<h1 className="text-3xl font-bold text-textPrimary">Guild Passes</h1>
					
					{/* Filters */}
					<div className="flex flex-col sm:flex-row gap-3">
						<Input
							placeholder="Search Guild Passes..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full sm:w-64"
							size="sm"
						/>
						<Select
							placeholder="Sort by"
							selectedKeys={[sortBy]}
							onChange={(e) => setSortBy(e.target.value)}
							className="w-full sm:w-48"
							size="sm"
						>
							<SelectItem key="newest" value="newest">Newest First</SelectItem>
							<SelectItem key="price-low" value="price-low">Price: Low to High</SelectItem>
							<SelectItem key="price-high" value="price-high">Price: High to Low</SelectItem>
						</Select>
					</div>
				</div>

				{/* Tabs */}
				<Tabs 
					selectedKey={activeTab} 
					onSelectionChange={(key) => setActiveTab(key as string)}
					aria-label="Guild Passes Tabs"
					className="w-full"
				>
					<Tab key="first-time" title="First Time Buy">
						<div className="mt-6">
							{currentIsLoading ? (
								<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
									{Array.from({ length: 16 }).map((_, index) => (
										<GuildedNFTSkeleton key={index} />
									))}
								</div>
							) : filteredNfts.length > 0 ? (
								<>
									<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
										{filteredNfts.map((nft: any, index: number) => (
											<Card 
												key={nft._id || index}
												className="w-full cursor-pointer hover:scale-105 transition-transform duration-200"
												isPressable
												onPress={() => handleNftClick(nft._id)}
											>
												<CardBody className="p-0">
													<Image
														src={nft.artworkUrl || "/next.svg"}
														alt={nft.title || "Guild Pass"}
														width={300}
														height={200}
														className="w-full h-48 object-cover rounded-t-lg"
														priority={index < 8}
													/>
												</CardBody>
												<CardFooter className="flex flex-col items-start gap-2 p-4">
													<h3 className="font-semibold text-[14px] leading-[19.12px] tracking-[-0.02em] text-black line-clamp-1">
														{nft.title || "Untitled Guild Pass"}
													</h3>
													{nft.user_array?.[0]?.name && (
														<p className="text-sm text-gray-600 line-clamp-1">
															by {nft.user_array[0].name}
														</p>
													)}
													<div className="flex items-center justify-between w-full">
														<span className="text-sm font-medium text-btnColor">
															{formatPrice(nft)}
														</span>
														{nft.tokenId && (
															<span className="text-xs text-gray-500">
																#{nft.tokenId}
															</span>
														)}
													</div>
												</CardFooter>
											</Card>
										))}
									</div>
									
									{currentHasNextPage && (
										<div ref={loadMoreRef} className="mt-8">
											{currentIsFetchingNextPage && (
												<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
													{Array.from({ length: 4 }).map((_, index) => (
														<GuildedNFTSkeleton key={`loading-${index}`} />
													))}
												</div>
											)}
										</div>
									)}
								</>
							) : (
								<NoDataFound message="No Guild Passes available for first-time purchase" />
							)}
						</div>
					</Tab>
					
					<Tab key="re-listed" title="Re-listed">
						<div className="mt-6">
							{currentIsLoading ? (
								<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
									{Array.from({ length: 16 }).map((_, index) => (
										<GuildedNFTSkeleton key={index} />
									))}
								</div>
							) : filteredNfts.length > 0 ? (
								<>
									<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
										{filteredNfts.map((nft: any, index: number) => (
											<Card 
												key={nft._id || index}
												className="w-full cursor-pointer hover:scale-105 transition-transform duration-200"
												isPressable
												onPress={() => handleNftClick(nft._id)}
											>
												<CardBody className="p-0">
													<Image
														src={nft.artworkUrl || "/next.svg"}
														alt={nft.title || "Guild Pass"}
														width={300}
														height={200}
														className="w-full h-48 object-cover rounded-t-lg"
														priority={index < 8}
													/>
												</CardBody>
												<CardFooter className="flex flex-col items-start gap-2 p-4">
													<h3 className="font-semibold text-[14px] leading-[19.12px] tracking-[-0.02em] text-black line-clamp-1">
														{nft.title || "Untitled Guild Pass"}
													</h3>
													{nft.user_array?.[0]?.name && (
														<p className="text-sm text-gray-600 line-clamp-1">
															by {nft.user_array[0].name}
														</p>
													)}
													<div className="flex items-center justify-between w-full">
														<span className="text-sm font-medium text-btnColor">
															{formatPrice(nft)}
														</span>
														{nft.tokenId && (
															<span className="text-xs text-gray-500">
																#{nft.tokenId}
															</span>
														)}
													</div>
												</CardFooter>
											</Card>
										))}
									</div>
									
									{currentHasNextPage && (
										<div ref={loadMoreRef} className="mt-8">
											{currentIsFetchingNextPage && (
												<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
													{Array.from({ length: 4 }).map((_, index) => (
														<GuildedNFTSkeleton key={`loading-${index}`} />
													))}
												</div>
											)}
										</div>
									)}
								</>
							) : (
								<NoDataFound message="No re-listed Guild Passes available" />
							)}
						</div>
					</Tab>
				</Tabs>
			</div>
		</div>
	)
}

export default GuildPassesPage
