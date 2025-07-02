
"use client"

import { defineChain, getContract, prepareContractCall, toWei } from "thirdweb"
import { useSendTransaction } from "thirdweb/react"
import { toast } from "react-toastify"

import { client } from "@/config"

export const usePurchaseNft = () => {
	const { mutate: sendTx, isPending, error, data } = useSendTransaction()

	const purchaseNFT = async ({
		listingId,
		quantity,
		chainId,
		marketplaceAddress,
		totalPriceWei,
		activeAccount
	}: {
		listingId: string
		quantity: number
		chainId: number
		marketplaceAddress: string
		totalPriceWei: string
		activeAccount: any
	}) => {
		if (!activeAccount?.address) {
			toast.error("Please connect your wallet")
			return
		}

		try {
			// Define the chain based on chainId
			const chain = defineChain(chainId)

			// Get marketplace contract
			const contract = getContract({
				client,
				chain,
				address: marketplaceAddress
			})

			// Prepare the contract call
			const transaction = prepareContractCall({
				contract,
				method: "function buyFromListing(uint256 _listingId, address _buyFor, uint256 _quantity, address _currency, uint256 _expectedTotalPrice) payable",
				params: [
					BigInt(listingId),
					activeAccount.address,
					BigInt(quantity),
					"0x0000000000000000000000000000000000000000", // Native token
					BigInt(totalPriceWei)
				],
				value: BigInt(totalPriceWei)
			})

			sendTx(transaction)
		} catch (error: any) {
			console.error("Error purchasing NFT:", error)
			toast.error(error?.message || "Failed to purchase NFT")
		}
	}

	return { purchaseNFT, isPending, error, data }
}
