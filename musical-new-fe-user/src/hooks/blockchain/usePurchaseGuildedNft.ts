
"use client"

import { defineChain, getContract, prepareContractCall, toWei } from "thirdweb"
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
		listingId,
		amount,
		maticPrice
	}: {
		listingId: string
		amount: string
		maticPrice: number
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
			value: toWei((maticPrice * Number(amount)).toString())
		})
		sendTx(transaction)
	}

	return { purchaseGuildedNFT, isPending, error, data }
}
