"use client"

import { toast } from "react-toastify"

import { defineChain, getContract, prepareContractCall } from "thirdweb"
import { useSendTransaction } from "thirdweb/react"

import { client } from "@/config"

const contract = getContract({
	client,
	chain: defineChain(
		Number(process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_CHAIN) || 80002
	),
	address: process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS || ""
})

export const useCancelNFTExchange = () => {
	const {
		mutate: sendTransaction,
		isPending,
		error,
		data
	} = useSendTransaction({
		payModal: {
			buyWithFiat: {
				prefillSource: {
					currency: "USD"
				},
				testMode: true
			}
		}
	})

	const cancelNFTExchange = (exchangeId: number) => {
		if (!contract) {
			toast.error("Contract not initialized")
			return
		}

		const transaction = prepareContractCall({
			contract,
			method: "function cancelNftExchange(uint256 _exchangeId)",
			params: [BigInt(exchangeId)]
		})

		sendTransaction(transaction)
	}

	return { cancelNFTExchange, isPending, error, data }
}
