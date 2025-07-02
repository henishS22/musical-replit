"use client"

import { useState } from "react"
import { toast } from "react-toastify"
import Image, { StaticImageData } from "next/image"

import { verifyTokenOwnership } from "@/app/api/mutation"
import { POLYGONSCAN_LOGO, PROFILE_IMAGE } from "@/assets"
import { Button } from "@nextui-org/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useActiveWallet } from "thirdweb/react"

import { useUserStore } from "@/stores"
import { useFetchTokenId } from "@/hooks/blockchain"

import NFTCard from "../profile/tokenTab/NftCard"
import BuyNftCardSkeleton from "./NFTCardSkeleton"

interface BuyNftCardProps {
	imageUrl: StaticImageData | string
	creatorImage?: StaticImageData | string
	creatorName: string
	title: string
	description: string
	isOwned?: boolean
	onBuyNow?: () => void
	isLoading?: boolean
	tokenId: string
	nftId?: string
	price?: string
	content?: React.ReactNode
	unlockText?: {
		onClick: () => void
	}
	setSignature?: (signature: string) => void
	setMessage?: (message: string) => void
	showVerifyButton: boolean
	ownerId: string
	txHash?: string
	ownedNftImageUrl?: StaticImageData | string
	ownedCreatorImage?: StaticImageData | string
	ownedCreatorName?: string
	ownedNftTitle?: string
}

export default function BuyNftCard({
	imageUrl,
	creatorImage = PROFILE_IMAGE,
	creatorName,
	title,
	description,
	price,
	tokenId,
	nftId,
	onBuyNow,
	isLoading = false,
	content,
	setSignature,
	setMessage,
	showVerifyButton = true,
	ownerId,
	txHash,
	ownedNftImageUrl,
	ownedCreatorImage,
	ownedCreatorName,
	ownedNftTitle
}: BuyNftCardProps) {
	const [isLoadingUnlock, setIsLoadingUnlock] = useState(false)
	const activeWallet = useActiveWallet()
	const queryClient = useQueryClient()
	const { userData } = useUserStore()

	const { data: tokenIdData } = useFetchTokenId()
	const { mutate, isPending } = useMutation({
		mutationFn: verifyTokenOwnership,
		onSuccess: (data, { signature, message }) => {
			if (data) {
				if (data?.isOwner) {
					setSignature?.(signature)
					setMessage?.(message)
					queryClient.invalidateQueries({ queryKey: ["studioTracks"] })
					queryClient.invalidateQueries({ queryKey: ["collectibles"] })
				} else {
					toast.error("You don't own this token")
				}
			}
		},
		onError: (error) => console.error("Verification failed:", error)
	})

	const contractAddress = process.env
		.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS as string
	const chainId = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_CHAIN as string

	const unlockToken = async () => {
		try {
			setIsLoadingUnlock(true)
			if (
				tokenIdData &&
				tokenIdData > 0 &&
				Number(tokenIdData) < Number(tokenId)
			) {
				throw new Error("NFT not found")
			}

			if (!activeWallet) {
				toast.error("Wallet not connected")
				return
			}

			const message = `Hello! Musical is verifying your token ownership. Contract: ${contractAddress}, Token ID: ${tokenId}`
			const signature = (await activeWallet
				.getAccount()
				?.signMessage({ message })) as string

			mutate({ signature, message, tokenId, contractAddress, chainId })
		} catch (error) {
			console.error("Error unlocking token:", error)
		} finally {
			setIsLoadingUnlock(false)
		}
	}

	if (isLoading) {
		return <BuyNftCardSkeleton />
	}

	return (
		<div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
			<div className="flex gap-10">
				<div className="w-[466px] h-[472px] relative">
					<Image
						src={imageUrl}
						alt="NFT"
						fill
						className="object-cover rounded-xl"
					/>
				</div>
				<div className="flex-1 flex flex-col gap-10">
					<div className="space-y-3">
						<div className="flex items-center gap-3">
							<div className="w-8 h-8 relative">
								<Image
									src={creatorImage || PROFILE_IMAGE}
									alt="Creator"
									fill
									className="object-cover rounded-full"
								/>
							</div>
							<span className="font-medium">{creatorName}</span>
						</div>
						<h1 className="font-semibold text-[32px] leading-[40px] tracking-[-0.03em] text-textPrimary">
							{title}
						</h1>
						<p className="font-medium text-[20px] leading-[32px] tracking-[-0.02em] text-[#6F767E]">
							{description}
						</p>
					</div>
					<div>
						{price && (
							<div className="font-semibold text-[32px] leading-[40px] tracking-[-0.03em] mb-4">
								{price} MATIC
							</div>
						)}

						{ownedNftImageUrl &&
							ownedCreatorImage &&
							ownedCreatorName &&
							ownedNftTitle && (
								<div className="flex flex-col items-start gap-3 bg-hoverGray rounded-xl p-4 mb-4 max-w-fit">
									<span className="font-medium text-[20px] leading-[32px] tracking-[-0.02em] text-textPrimary">
										Tokens for exchange
									</span>
									<div className="flex flex-wrap gap-2 scrollbar overflow-x-auto max-h-[320px] !pr-0">
										<NFTCard
											artworkUrl={ownedNftImageUrl}
											title={ownedNftTitle}
											artist={ownedCreatorName}
											id={tokenId}
											key={tokenId}
										/>
									</div>
								</div>
							)}

						{content ? (
							content
						) : (
							<Button
								onPress={onBuyNow}
								className="w-fit bg-btnColor text-white text-[15px] font-bold py-3 px-[88px] rounded-xl mt-1"
								isDisabled={
									isLoadingUnlock || isPending || ownerId === userData?._id
								}
							>
								Buy Now
							</Button>
						)}

						{showVerifyButton && (
							<p className="font-medium text-[18px] leading-[32px] tracking-[-0.02em] mt-2 text-textGray flex items-center gap-2">
								Already own this token?{" "}
								<Button
									className="text-waveformBlue cursor-pointer bg-transparent p-0 justify-start"
									onPress={unlockToken}
									isLoading={isLoadingUnlock || isPending}
								>
									Unlock
								</Button>
							</p>
						)}
					</div>
					<div
						className="font-medium text-[20px] leading-[32px] tracking-[-0.02em] text-waveformBlue flex items-center gap-2 cursor-pointer"
						onClick={() =>
							window.open(
								`${process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL}${txHash}`,
								"_blank"
							)
						}
					>
						View this token on
						<Image
							src={POLYGONSCAN_LOGO}
							alt="Polygonscan"
							width={36}
							height={36}
						/>
						Polygonscan
					</div>
				</div>
			</div>
		</div>
	)
}