"use client"

import { toast } from "react-toastify"

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

export const useListNFT = () => {
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

	const listNFT = ({
		seller,
		tokenId,
		price,
		amount
	}: {
		seller: string
		tokenId: string
		price: string
		amount: string
	}) => {
		if (!contract) {
			toast.error("Contract not initialized")
			return
		}

		const transaction = prepareContractCall({
			contract,
			method:
				"function listNFT(address _seller, uint256 _tokenId, uint256 _price, uint256 _amount)",
			params: [seller, BigInt(tokenId), toWei(price), BigInt(amount)]
		})

		sendTransaction(transaction)
	}

	return { listNFT, isPending, error, data }
}
