
"use client"

import { defineChain, getContract, prepareContractCall } from "thirdweb"
import { useSendTransaction } from "thirdweb/react"
import { useActiveAccount } from "thirdweb/react"
import { toast } from "react-toastify"

import { client } from "@/config"

const contract = getContract({
	client,
	chain: defineChain(
		Number(process.env.NEXT_PUBLIC_GUILDED_MARKETPLACE_CONTRACT_CHAIN) || 84532
	),
	address: process.env.NEXT_PUBLIC_GUILDED_MARKETPLACE_CONTRACT_ADDRESS || "0x067578da19fD94c8F1c9A8CEBbcC8ADB6421dae4"
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
	
	const activeAccount = useActiveAccount()

	const purchaseGuildedNFT = async ({
		listingId,
		tokenId,
		networkChainId
	}: {
		listingId: string
		tokenId: string
		networkChainId: string
	}) => {
		if (!contract) {
			console.error("Contract not initialized")
			return
		}

		if (!activeAccount?.address) {
			toast.error("Please connect your wallet")
			return
		}

		try {
			// Call the signature API to get signature, timestamp, and maxPrice
			const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/guilded-nft/signature`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					buyer: activeAccount.address,
					tokenId: parseInt(tokenId),
					networkChainId: networkChainId
				})
			})

			if (!response.ok) {
				toast.error("Failed to get signature for purchase")
				return
			}

			const signatureData = await response.json()
			const { signature, timestamp, maxPrice } = signatureData

			// Prepare the contract call with the new purchaseGuildedNFT method
			const transaction = prepareContractCall({
				contract,
				method: "function purchaseGuildedNFT(uint256 _guildedListingId, uint256 _maxPrice, uint256 _timestamp, bytes _signature) payable",
				params: [
					BigInt(listingId),
					BigInt(maxPrice),
					BigInt(timestamp),
					signature
				],
				value: BigInt(maxPrice)
			})

			sendTx(transaction)
		} catch (error: any) {
			console.error("Error purchasing Guilded NFT:", error)
			toast.error(error?.message || "Failed to purchase NFT")
		}
	}

	return { purchaseGuildedNFT, isPending, error, data }
}
