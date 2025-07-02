
"use client"

import { defineChain, getContract, prepareContractCall } from "thirdweb"
import { useSendTransaction } from "thirdweb/react"
import { toast } from "react-toastify"

import { client } from "@/config"
import { apiRequest } from "@/helpers/apiHelpers"

export const usePurchaseGuildedNft = () => {
	const { mutate: sendTx, isPending, error, data } = useSendTransaction()

	const purchaseGuildedNFT = async ({
		listingId,
		nftId,
		networkChainId,
		activeAccount
	}: {
		listingId: string
		nftId: string
		networkChainId: string
		activeAccount: any
	}) => {
		if (!activeAccount?.address) {
			toast.error("Please connect your wallet")
			return
		}

		if (!listingId || !nftId || !networkChainId) {
			toast.error("Missing required parameters")
			return
		}

		try {
			// First fetch the NFT details to get the tokenId
			const nftDetails = await apiRequest({
				url: `guilded-nft/getGuildedNftsById/${nftId}`,
				method: "GET"
			});

			if (!nftDetails || !nftDetails.tokenId) {
				throw new Error("Failed to fetch NFT details or tokenId not found")
			}

			// Call the signature API to get signature, timestamp, and maxPrice
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

			// Define the chain based on networkChainId
			const chain = defineChain(parseInt(networkChainId))

			// Get Guilded marketplace contract address based on chain
			let contractAddress = ""
			if (networkChainId === "84532") { // Base Sepolia
				contractAddress = "0x067578da19fD94c8F1c9A8CEBbcC8ADB6421dae4"
			} else if (networkChainId === "137") { // Polygon
				contractAddress = "0x067578da19fD94c8F1c9A8CEBbcC8ADB6421dae4"
			} else {
				throw new Error("Unsupported network for Guilded NFT")
			}

			// Get contract instance
			const contract = getContract({
				client,
				chain,
				address: contractAddress
			})

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
