"use client"

import { defineChain, getContract, prepareContractCall } from "thirdweb"
import { useSendTransaction } from "thirdweb/react"

import { client } from "@/config"

const contract = getContract({
	client,
	chain: defineChain(
		Number(process.env.NEXT_PUBLIC_TOKEN_CONTRACT_CHAIN) || 80002
	),
	address: process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || ""
})

export const useSetApprovalForAll = () => {
	const {
		mutate: sendTransaction,
		isPending,
		error,
		data,
		isSuccess
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

	const setApprovalForAll = () => {
		if (!contract) {
			console.error("Contract not initialized")
			return
		}

		const transaction = prepareContractCall({
			contract,
			method: "function setApprovalForAll(address operator, bool approved)",
			params: [
				process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS as string,
				true
			]
		})

		sendTransaction(transaction)
	}

	return { setApprovalForAll, isPending, error, data, isSuccess }
}
