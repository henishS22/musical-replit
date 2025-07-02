
"use client"

import { defineChain, getContract, prepareContractCall, toWei } from "thirdweb"
import { useSendTransaction } from "thirdweb/react"
import { useActiveAccount } from "thirdweb/react"
import { toast } from "react-toastify"

import { client } from "@/config"
import { apiRequest } from "@/app/api/query"

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
			const signatureResponse = await apiRequest({
				url: `/guilded-nft/signature`,
				method: "POST",
				data: {
					buyer: activeAccount.address,
					tokenId: parseInt(tokenId),
					networkChainId: networkChainId
				}
			})

			if (!signatureResponse?.data) {
				toast.error("Failed to get signature for purchase")
				return
			}

			const { signature, timestamp, maxPrice } = signatureResponse.data

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
