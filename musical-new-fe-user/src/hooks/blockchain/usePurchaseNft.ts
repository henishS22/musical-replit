"use client"

import { defineChain, getContract, prepareContractCall, toWei } from "thirdweb"
import { useSendTransaction } from "thirdweb/react"

import { client } from "@/config"

const contract = getContract({
	client,
	chain: defineChain(
		Number(process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_CHAIN) || 80002
	),
	address: process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS || ""
})

export const usePurchaseNft = () => {
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

	const purchaseNFT = ({
		listingId,
		amount,
		price
	}: {
		listingId: string
		amount: string
		price: number
	}) => {
		if (!contract) {
			console.error("Contract not initialized")
			return
		}

		const transaction = prepareContractCall({
			contract,
			method:
				"function purchaseNFT(uint256 _listingId, uint256 _amount) payable",
			params: [BigInt(listingId), BigInt(amount)],
			value: toWei(price.toString())
		})
		sendTx(transaction)
	}

	return { purchaseNFT, isPending, error, data }
}
