"use client"

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

export const useRegisterExchange = () => {
	const {
		mutate: sendTransaction,
		isPending,
		error,
		data
	} = useSendTransaction()

	const registerExchange = ({
		tokenId,
		amount,
		exchangeId
	}: {
		tokenId: number
		amount: number
		exchangeId: number
	}) => {
		if (!contract) {
			console.error("Contract not initialized")
			return
		}

		const transaction = prepareContractCall({
			contract,
			method:
				"function registerNftExchange(uint256 _tokenId, uint256 _amount, uint256 _exchangeId)",
			params: [BigInt(tokenId), BigInt(amount), BigInt(exchangeId)]
		})

		sendTransaction(transaction)
	}

	return { registerExchange, isPending, error, data }
}
