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

export const useApproveNFTExchange = () => {
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

	const approveNFTExchange = (exchangeId: number) => {
		if (!contract) {
			toast.error("Contract not initialized")
			return
		}

		const transaction = prepareContractCall({
			contract,
			method: "function approveNftForExchange(uint256 _exchangeId)",
			params: [BigInt(exchangeId)]
		})

		sendTransaction(transaction)
	}

	return { approveNFTExchange, isPending, error, data }
}
