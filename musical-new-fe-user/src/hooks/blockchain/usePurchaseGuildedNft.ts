
"use client"

import { defineChain, getContract, prepareContractCall } from "thirdweb"
import { useSendTransaction } from "thirdweb/react"

import { client } from "@/config"

const contract = getContract({
	client,
	chain: defineChain(
		84532
	),
	address: '0x067578da19fD94c8F1c9A8CEBbcC8ADB6421dae4'
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
				"function purchaseGuildedNFT(uint256 _guildedListingId, uint256 _maxPrice, uint256 _timestamp, bytes _signature) payable",
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
