"use client"

import { defineChain, getContract, prepareContractCall, toWei } from "thirdweb"
import { useSendTransaction } from "thirdweb/react"
import { useActiveAccount } from "thirdweb/react"
import { toast } from "react-toastify"

import { client } from "@/config"
import { apiRequest } from "@/helpers/apiHelpers"

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
		nftDetails,
		networkChainId,
		maticPrice
	}: {
		listingId: string
		nftDetails: any
		networkChainId: string
		maticPrice?: number
	}) => {
		if (!activeAccount?.address) {
			toast.error("Please connect your wallet")
			return
		}

		if (!listingId || !nftDetails?.tokenId || !networkChainId) {
			toast.error("Missing required parameters: listingId, tokenId, or networkChainId")
			return
		}

		if (!contract) {
			console.error("Contract not initialized")
			return
		}

		try {
			// Call the signature API to get signature, timestamp, and maxPrice using apiRequest helper
			const signatureData = await apiRequest({
				url: "guilded-nft/signature",
				method: "POST",
				payload: {
					buyer: activeAccount.address,
					tokenId: parseInt(nftDetails.tokenId),
					networkChainId: networkChainId
				}
			});

			if (!signatureData) {
				throw new Error("Failed to get signature from server")
			}

			const { signature, timestamp, maxPrice } = signatureData

			console.log("Signature data received:", { signature, timestamp, maxPrice })

			// Prepare the contract call with the purchaseGuildedNFT method
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
			toast.error(error?.message || "Failed to purchase Guilded NFT")
		}
	}

	return { purchaseGuildedNFT, isPending, error, data }
}