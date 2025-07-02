"use client"

import React from "react"
import { useInView } from "react-intersection-observer"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { fetchGuildedNfts } from "@/app/api/query"
import { generateQueryParams } from "@/helpers"
import { Button, Skeleton, Card, CardBody, CardFooter } from "@nextui-org/react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { toast } from "react-toastify"

import { usePurchaseGuildedNft } from "@/hooks/blockchain"
import { useActiveAccount } from "thirdweb/react"
import { NoDataFound } from "../ui"

interface GuildedNFTProps {
	showAll?: boolean
	onViewAll?: (section: string) => void
}

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



const GuildedNFT: React.FC<GuildedNFTProps> = ({ showAll = false, onViewAll }) => {
	const router = useRouter()
	const { ref: loadMoreRef, inView } = useInView()
	const { purchaseGuildedNFT, isPending } = usePurchaseGuildedNft()
	const activeAccount = useActiveAccount()

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
		useInfiniteQuery({
			queryKey: ["guilded-nfts"],
			queryFn: async ({ pageParam = 1 }) => {
				const url = generateQueryParams({
					page: pageParam,
					limit: showAll ? 12 : 8,
					isListed: true
				})
				return fetchGuildedNfts(url)
			},
			initialPageParam: 1,
			getNextPageParam: (lastPage) => {
				const totalItems = lastPage?.pagination?.total || 0
				const currentPage = lastPage?.pagination?.page || 1
				const limit = lastPage?.pagination?.limit || 8
				const nextPage = currentPage + 1
				return currentPage * limit < totalItems ? nextPage : undefined
			},
			staleTime: 1000 * 60 * 5, // 5 minutes
			retry: 2
		})

	// Only flatten all pages if showAll, otherwise just take first batch from first page
	const guildedNfts = React.useMemo(() => {
		if (showAll) {
			return data?.pages.flatMap((page) => page?.data ?? []) || []
		}
		return data?.pages?.[0]?.data?.slice(0, 8) || []
	}, [data, showAll])

	React.useEffect(() => {
		if (showAll && inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage()
		}
	}, [showAll, inView, hasNextPage, isFetchingNextPage, fetchNextPage])

	const handleNftClick = (nftId: string) => {
		router.push(`/buy-nft/${nftId}`)
	}

	const handleGuildedNftPurchase = async (nft: any) => {
		if (!activeAccount?.address) {
			toast.error("Please connect your wallet")
			return
		}

		await purchaseGuildedNFT({
			listingId: nft.listingId,
			nftId: nft._id,
			networkChainId: nft.chainId || "84532", // Default to Base Sepolia
			activeAccount
		})
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
		return "$499"
	}

	if (error) {
		return (
			<div className="flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<h2 className="font-semibold text-[20px] leading-[32px] tracking-[-0.02em] text-textPrimary">
						Guild Passes
					</h2>
					{onViewAll && (
						<Button
							onPress={() => onViewAll("Guild Passes")}
							type="submit"
							className="px-5 py-3 gap-2 rounded-lg bg-btnColor text-white font-bold text-[15px]"
						>
							View All
						</Button>
					)}
				</div>
				<div className="w-full">
					<NoDataFound message="Failed to load Guild Passes. Please try again later." />
				</div>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap gap-10 justify-between items-center w-full max-md:max-w-full">
				<div className="self-stretch my-1 font-semibold text-[20px] leading-[32px] tracking-[-0.02em] text-textPrimary">
					Guild Passes
				</div>
				{onViewAll && !showAll && (
					<Button
						onPress={() => onViewAll("Guild Passes")}
						type="submit"
						className="px-5 py-3 gap-2 rounded-lg bg-btnColor text-white font-bold text-[15px]"
					>
						View All
					</Button>
				)}
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
				{isLoading ? (
					Array.from({ length: showAll ? 12 : 8 }).map((_, index) => (
						<GuildedNFTSkeleton key={index} />
					))
				) : guildedNfts.length > 0 ? (
					guildedNfts.slice(0, showAll ? guildedNfts.length : 8).map((nft: any, index: number) => (
						<Card 
							key={nft._id || index}
							className="w-full cursor-pointer hover:scale-105 transition-transform duration-200"
							isPressable
							onPress={() => handleGuildedNftPurchase(nft)}
						>
							<CardBody className="p-0">
								<Image
									src={nft.artworkUrl || "/next.svg"}
									alt={nft.title || "Guild Pass"}
									width={300}
									height={200}
									className="w-full h-48 object-cover rounded-t-lg"
									priority={index < 4}
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
					))
				) : (
					<div className="w-full col-span-full">
						<NoDataFound message="No Guild Passes available at the moment" />
					</div>
				)}
			</div>

			{showAll && hasNextPage && (
				<div ref={loadMoreRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
					{isFetchingNextPage && (
						Array.from({ length: 4 }).map((_, index) => (
							<GuildedNFTSkeleton key={`loading-${index}`} />
						))
					)}
				</div>
			)}
		</div>
	)
}

export default GuildedNFT