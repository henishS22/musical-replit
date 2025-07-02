
"use client"

import React from "react"
import Image from "next/image"
import { Button, Card, CardBody, CardFooter } from "@nextui-org/react"

interface GuildedNftCardProps {
	title?: string
	description?: string
	artworkUrl?: string
	onBuyNow?: () => void
	isLoading?: boolean
	tokenId: string
	nftId: string
	price?: string
	content?: React.ReactNode
	unlockText?: {
		title: string
		description: string
	}
}

const GuildedNftCard: React.FC<GuildedNftCardProps> = ({
	title,
	artworkUrl,
	description,
	price,
	tokenId,
	nftId,
	onBuyNow,
	isLoading = false,
	content,
	unlockText
}) => {
	return (
		<Card className="w-full max-w-sm mx-auto">
			<CardBody className="p-0">
				<div className="relative">
					<Image
						src={artworkUrl || "/next.svg"}
						alt={title || "Guild Pass"}
						width={400}
						height={300}
						className="w-full h-64 object-cover rounded-t-lg"
						priority
					/>
					<div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold">
						Guild Pass
					</div>
				</div>
			</CardBody>
			<CardFooter className="flex flex-col items-start gap-4 p-6">
				<div className="w-full">
					<h3 className="font-bold text-xl mb-2">{title}</h3>
					{description && (
						<p className="text-gray-600 text-sm mb-4 line-clamp-3">{description}</p>
					)}
					
					{unlockText && (
						<div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
							<h4 className="font-semibold text-purple-800 mb-1">{unlockText.title}</h4>
							<p className="text-purple-700 text-sm">{unlockText.description}</p>
						</div>
					)}

					{content && (
						<div className="mb-4">
							{content}
						</div>
					)}
					
					<div className="flex items-center justify-between w-full mb-4">
						{price && (
							<div className="text-right">
								<p className="text-sm text-gray-500">Price</p>
								<p className="font-bold text-lg">{price}</p>
							</div>
						)}
						<div className="text-right">
							<p className="text-sm text-gray-500">Token ID</p>
							<p className="font-medium">#{tokenId}</p>
						</div>
					</div>
				</div>
				
				<Button
					onPress={onBuyNow}
					isLoading={isLoading}
					disabled={isLoading}
					className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold py-3 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200"
				>
					{isLoading ? "Processing..." : "Buy Guild Pass"}
				</Button>
			</CardFooter>
		</Card>
	)
}

export default GuildedNftCard
