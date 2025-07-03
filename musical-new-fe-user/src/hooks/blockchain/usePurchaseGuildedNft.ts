
"use client"

import { defineChain, getContract, prepareContractCall } from "thirdweb"
import { useSendTransaction } from "thirdweb/react"

import { client } from "@/config"

const contract = getContract({
	client,
	chain: defineChain(
		Number(process.env.NEXT_PUBLIC_GUILDED_MARKETPLACE_CONTRACT_CHAIN) || 84532
	),
	address: process.env.NEXT_PUBLIC_GUILDED_MARKETPLACE_CONTRACT_ADDRESS || ""
})

export const usePurchaseGuildedNft = () => {
	const {
		mutate: sendTx,
		isPending,
		error,
		data
	} = useSendTransaction({
		payModal: {
			buyWithFiat: {
				testMode: true // defaults to false
			}
		}
	})

	const purchaseGuildedNFT = ({
		guildedListingId,
		maxPrice,
		timestamp,
		signature
	}: {
		guildedListingId: string
		maxPrice: string
		timestamp: string
		signature: string
	}) => {
		if (!contract) {
			console.error("Contract not initialized")
			return
		}

		const transaction = prepareContractCall({
			contract,
			method:
				"function purchaseGuildedNFT(uint256 _guildedListingId, uint256 _maxPrice, uint256 _timestamp, bytes calldata _signature)",
			params: [
				BigInt(guildedListingId),
				BigInt(maxPrice),
				BigInt(timestamp),
				signature
			],
			value: BigInt(maxPrice)
		})
		sendTx(transaction)
	}

	return { purchaseGuildedNFT, isPending, error, data }
}
